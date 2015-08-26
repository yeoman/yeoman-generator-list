'use strict';

var Q = require('q');
var npmKeywordSearch = require('./npm-keyword-search');
var npmPackageInfo = require('./npm-package-info');
var npmDownloadCounts = require('./npm-download-counts');
var ghStats = require('./gh-stats');

var log = process.env.LOGGER || console;

module.exports = function (keyword, limit) {
  log.info('Update: keyword: %s, GH limit: %s', keyword, limit);

  return npmKeywordSearch(keyword)
    .then(npmPackageInfo)
    .then(npmDownloadCounts)
    .then(function (data) {
      return ghStats(data, limit);
    })
    .catch(function (err) {
      log.error('error while fetching list', err);
      Q.reject(err);
      return;
    });
};
