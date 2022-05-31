const Github = require('./scrapers/github');
const LinkedIn = require('./scrapers/linkedin');
const Profiles = require('./profiles');

const scrapers = {
  Github: new Github({}),
  Linkedin: new LinkedIn({}),
};

const profiles = new Profiles().getAll();

(async () => {
  scrapers.Github.setProfiles(profiles);
  await scrapers.Github.scrape();
  await scrapers.Github.saveToCsv();
})();

// scrapers.Linkedin.setProfiles(profiles);
// scrapers.Linkedin.scrape();
