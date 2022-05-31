const puppeteer = require('puppeteer');

class LinkedIn {
  constructor() {
    this.profiles = [];
    this.linkedinProfiles = [];
  }

  setProfiles(profiles) {
    this.profiles = profiles;
  }

  static filterProfilesWithLinkedIn(profiles) {
    return profiles.filter((profile) => profile.linkedin);
  }

  async scrapLinks() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      for (const profile of this.profiles) {
        const link = `https://www.linkedin.com/in/${profile.username}`;

        const response = await page.goto(link);

        console.log(response);

        if (response && response.status() === 200) {
          const position = await page.$eval('#main  div.text-body-medium.break-words', (el) => el.textContent);

          profile.linkedin = {
            link,
            position,
          };
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

      this.linkedinProfiles = LinkedIn.filterProfilesWithLinkedIn(this.profiles);

      console.log(JSON.stringify(this.linkedinProfiles, null, 2));
    } catch (error) {
      console.error('Error scraping github: ', error);
    }
  }
}

module.exports = LinkedIn;
