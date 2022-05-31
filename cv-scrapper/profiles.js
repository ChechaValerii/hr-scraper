const glob = require('glob');
const path = require('path');

class Profiles {
  constructor() {
    this.profiles = [];

    this.initProfiles();
  }

  initProfiles() {
    const paths = glob.sync('./tg-data/*.json');

    this.profiles = paths.map((pathJson) => {
      // eslint-disable-next-line import/no-dynamic-require,global-require
      const profiles = require(path.resolve(pathJson));

      return Object.values(profiles);
    }).flat();
  }

  getAll() {
    return this.profiles;
  }
}

module.exports = Profiles;
