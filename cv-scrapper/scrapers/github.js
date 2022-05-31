const fs = require('fs');
const puppeteer = require('puppeteer');
const { Parser } = require('json2csv');

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'codejsnodejs@gmail.com';
const GITHUB_PASSWORD = process.env.GITHUB_PASSWORD || '123codejsnodejs.';
const GITHUB_URL = 'https://github.com';

class Github {
  constructor() {
    this.profiles = [];
    this.githubProfiles = [];
  }

  setProfiles(profiles) {
    this.profiles = profiles;
  }

  static filterProfilesWithGithub(profiles) {
    return profiles.filter((profile) => profile.github);
  }

  static async scrapRepoCount(page) {
    try {
      const count = page.$eval('[data-tab-item="repositories"] .Counter', (el) => el.textContent);

      return count;
    } catch (error) {
      return 0;
    }
  }

  static async scrapOrganizations(page) {
    try {
      const org = page.evaluate(() => {
        const organizationsList = [];

        [...document.querySelectorAll('[data-hovercard-type="organization"]')]
          .forEach((element) => {
            organizationsList.push(element.getAttribute('aria-label'));
          });

        return organizationsList.join(',');
      });

      return org;
    } catch (error) {
      return '';
    }
  }

  static async scrapProgrammingLanguage(page, link) {
    try {
      await page.goto(`${link}?tab=repositories`);

      const lang = await page.evaluate(() => {
        const languages = {};

        [...document.querySelectorAll('[itemprop="programmingLanguage"]')]
          .forEach((element) => {
            languages[element.textContent] = (languages[element.textContent] || 0) + 1;
          });

        return languages;
      });

      return lang;
    } catch (error) {
      return '';
    }
  }

  static async scrapContributions(page) {
    try {
      const contribText = page.$eval('div.js-yearly-contributions > div:nth-child(1) > h2', (el) => el.textContent);

      return parseInt(contribText.replace(/[^0-9]/g, ''), 10);
    } catch (error) {
      return '';
    }
  }

  static async scrapEmail(page) {
    try {
      const email = await page.$eval('[itemprop="email"] a', (el) => el.textContent);

      return email;
    } catch (error) {
      return '';
    }
  }

  static async login(page) {
    await page.goto(`${GITHUB_URL}/login`);
    await page.waitFor('#login_field');
    await page.type('#login_field', GITHUB_USERNAME);
    await page.type('#password', GITHUB_PASSWORD);
    await page.click('[name="commit"]');
    await page.waitForNavigation();
  }

  async scrapLinks() {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    await Github.login(page);

    try {
      for (const profile of this.profiles) {
        const link = `${GITHUB_URL}/${profile.username}`;

        const response = await page.goto(link);

        if (response.status() === 200) {
          const [
            repoCount,
            organizations,
            contributions,
            email,
          ] = await Promise.all([
            Github.scrapRepoCount(page),
            Github.scrapOrganizations(page),
            Github.scrapContributions(page),
            Github.scrapEmail(page),
          ]);

          const languages = await Github.scrapProgrammingLanguage(page, link);

          profile.github = link;
          profile.email = email;
          profile.repository = repoCount;
          profile.contributions = contributions;
          profile.languages = languages;
          profile.organizations = organizations;
        }
      }
    } catch (error) {
      await browser.close();

      throw error;
    } finally {
      await browser.close();
    }

    await browser.close();
  }

  async scrape() {
    try {
      await this.scrapLinks();

      this.githubProfiles = Github.filterProfilesWithGithub(this.profiles);

      console.log(JSON.stringify(this.githubProfiles, null, 2));
    } catch (error) {
      console.error('Error scraping github: ', error);
    }
  }

  saveToCsv() {
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(this.githubProfiles);

    fs.writeFileSync('./github.csv', csv);
  }
}

module.exports = Github;
