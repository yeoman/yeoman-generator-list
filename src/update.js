'use strict';

const npmKeywordSearch = require('./npm-keyword-search');
const npmsPackageInfo = require('./npms-package-info');
const log = require('./logger');

module.exports = keyword => {
  log.info('\n\n\n----\nDate: %s', new Date());

  return npmKeywordSearch(keyword)
    .then(npmsPackageInfo)
    .catch(err => {
      log.error('Updater: Could not update the list ', err);
      return err;
    });
};
