'use strict';

const npmKeywordSearch = require('./npm-keyword-search');
const npmPackageInfo = require('./npm-package-info');
const npmDownloadCounts = require('./npm-download-counts');
const ghStats = require('./gh-stats');
const log = require('./logger');

module.exports = (keyword, limit) => {
  log.info('\n\n\n----\nDate: %s', new Date());
  log.info('Update: keyword: %s, GH limit: %s', keyword, limit);

  return npmKeywordSearch(keyword)
    .then(npmPackageInfo)
    .then(npmDownloadCounts)
    .then(data => ghStats(data, limit))
    .catch(err => {
      log.error('Updater: Could not update the list ', err);
      return err;
    });
};
