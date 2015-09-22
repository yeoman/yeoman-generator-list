'use strict';

var Q = require('q');
var ghStats = require('./gh-stats');
var npmDownloadCounts = require('./npm-download-counts');
var npmKeywordSearch = require('./npm-keyword-search');
var npmPackageInfo = require('./npm-package-info');
var yoBlackList = require('./yo-blacklist');

var log = process.env.LOGGER || console;

module.exports = function (keyword, limit) {
  log.info('Update: keyword: %s, GH limit: %s', keyword, limit);

  return npmKeywordSearch(keyword)
    .then(yoBlackList)
    .then(npmPackageInfo)
    .then(npmDownloadCounts)
    .then(function (data) {
      return ghStats(data, limit);
    })
    .catch(function (err) {
      log.error('Could not updated the list ', err);
      Q.reject(err);
      return;
    });
};
