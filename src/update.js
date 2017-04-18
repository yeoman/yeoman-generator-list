'use strict';

const npmKeywordSearch = require('./npm-keyword-search');
const npmsPackageInfo = require('./npms-package-info');
const log = require('./logger');

module.exports = keyword => npmKeywordSearch(keyword)
  .then(npmsPackageInfo)
  .catch(err => {
    log.error(`Updater: Could not update the list ${err}`);
    throw new Error('Updater: Stop process to prevent a empty list.');
  });
