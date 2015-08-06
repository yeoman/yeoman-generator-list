'use strict';

var npmDownloadCounts = require('./npm-download-counts');
var npmKeywordSearch = require('./npm-keyword-search');
var npmPackageInfo = require('./npm-package-info');
var ghStats = require('./gh-stats');

module.exports = function (keyword, limit) {
  this.emit(
    'log', 'Update list for npm keyword: ' + keyword +
    ' and GH limit of ' + limit
  );
  if (typeof keyword === 'undefined') {
    this.emit('error', 'Keyword is required', keyword);
    return;
  }

  return this.q
    .fcall(npmKeywordSearch.bind(this, keyword))
    .then(npmPackageInfo.bind(this))
    .then(npmDownloadCounts.bind(this))
    .then(function (list) {
      return ghStats.call(this, list, limit);
    }.bind(this))
    .then(function (list) {
      this.list = list;
      this.emit('log', 'List updated: ' + this.list.length + ' plugins');
      this.emit('updated', this.list);
      return this.list;
    }.bind(this))
    .catch(function (err) {
      this.emit('error', 'error while fetching list', err);
    }.bind(this));
};
