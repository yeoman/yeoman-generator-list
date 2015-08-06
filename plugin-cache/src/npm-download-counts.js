'use strict';

var http = require('https');
var Q = require('q');
var packageJson = require('package-json');

var log = process.env.LOGGER || console;

// Failures here should not prevent the list from moving on
module.exports = function (list) {
  log.info('Getting downloads for %s packages', list.length);

  var count = 0;
  var url = 'https://api.npmjs.org/downloads/point/last-month/';

  return Q.allSettled(list.map(function (plugin) {
    var d = Q.defer();

    try {
      http.get(url + encodeURIComponent(plugin.name), function (res) {
        res.setEncoding('utf-8');

        var body = '';
        res.on('data', function (data) {
          body += data;
        });

        res.on('end', function () {
          var parsed;
          try {
            parsed = JSON.parse(body);
          } catch (e) {
            d.resolve(plugin);
            return;
          }

          plugin.downloads = parsed.downloads || 0;
          count++;

          d.resolve(plugin);
        });
      })
      .on('error', function () {
        d.resolve(plugin);
      });
    } catch (e) {
      d.resolve(plugin);
    }

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
    log.error('Could not get download counts', err);
    Q.reject(err);
    return;
  });
};
