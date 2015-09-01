'use strict';

var Q = require('q');
var packageJson = require('package-json');

var log = process.env.LOGGER || console;

module.exports = function (list) {
  log.info('Fetching package info for %s packages', list.length);

  return Q.allSettled(list.map(function (plugin) {
    var d = Q.defer();

    packageJson(plugin, function (err, pkg) {
      if (err) {
        log.error('Unable to fetch package info for %s ', plugin, err);
        d.reject(err);
        return;
      }

      d.resolve({
        author: pkg.author,
        description: pkg.description,
        name: pkg.name,
        repo: pkg.repository && pkg.repository.type === 'git' ?
          pkg.repository.url : false,
        website: pkg.homepage || false
      });
    });

    return d.promise;
  }))
  .then(function (plugins) {
    var list = [];

    plugins.forEach(function (plugin) {
      if (plugin.state === 'fulfilled') {
        list.push(plugin.value);
      }
    });

    log.info('Fetched info for %s packages', list.length);

    return list;
  })
  .catch(function (err) {
    log.error('Could not fetch package info ', err);
    Q.reject(err);
    return;
  });
};
