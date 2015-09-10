'use strict';
var got = require('got');
var Q = require('q');

var log = process.env.LOGGER || console;

module.exports = function (list) {
  log.info('Getting downloads for %s packages', list.length);

  var count = 0;
  var url = 'https://api.npmjs.org/downloads/point/last-month/';

  return Q.allSettled(list.map(function (plugin) {
    var d = Q.defer();

    got(url + encodeURIComponent(plugin.name)).then(function (res) {
      var parsed = JSON.parse(body);
      plugin.downloads = parsed.downloads || 0;
      count++;

      d.resolve(plugin);
    }).catch(function () {
      // Failures here should not prevent the list from moving on
      d.resolve(plugin);
    });

    return d.promise;
  }))
  .then(function (plugins) {
    var message = 'Fetched download stats for %s packages';
    var skipped = list.length - count;
    if (skipped) {
      message += '. Skipped %s packages';
    }
    log.info(message, count, skipped);

    return plugins.map(function (item) {
      return item.value;
    });
  })
  .catch(function (err) {
    log.error('Could not get download counts ', err);
    Q.reject(err);
    return;
  });
};
