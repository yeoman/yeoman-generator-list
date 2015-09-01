'use strict';

var Q = require('q');
var npmKeyword = require('npm-keyword');

var log = process.env.LOGGER || console;

module.exports = function (keyword) {
  log.info('Starting keyword search: %s', keyword);

  var d = Q.defer();

  npmKeyword.names(keyword, function (err, packages) {
    if (err) {
      log.error('Unable to search for keywords ', err);
      d.reject(err);
      return;
    }

    log.info('Found %s packages', packages.length);
    d.resolve(packages);
  });

  return d.promise;
};
