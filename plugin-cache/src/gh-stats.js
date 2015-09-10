'use strict';

var gh = require('github-url-to-object');
var Q = require('q');
var ghGot = require('gh-got');
var merge = require('./merge-info');

var log = process.env.LOGGER || console;

module.exports = function (list, limit) {
  limit = limit || list.length;
  limit = list.length < limit ? list.length : limit;
  log.info('Fetching GH stats for %s packages', limit);

  var count = 0;
  var limitMessage = false;

  return Q.allSettled(list.map(function (plugin) {
    var d = Q.defer();

    if (plugin.repo) {
      var url = gh(plugin.repo);

      if (url && url.user && url.repo) {
        plugin.repo = url.user + '/' + url.repo;
      } else {
        plugin.repo = false;
      }
    }

    if (limit && limit === count && !limitMessage) {
      log.info('Limit (%s) reached for GH API calls', limit);
      limitMessage = true;
    }

    if (!plugin.repo || (limit && limit < ++count)) {
      d.resolve(merge(plugin));
    } else {
      ghGot('repos/' + plugin.repo, {
        query: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET
        },
        headers: {
          'user-agent': 'https://github.com/yeoman/yeoman-generator-list'
        }
      }).then(function (res) {
        count++;
        d.resolve(merge(plugin, res.body));
      }).catch(function () {
        d.resolve(merge(plugin));
      });
    }

    return d.promise;
  }))
  .then(function (plugins) {
    var message = 'Fetched GH stats for %s packages';
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
    log.error('Could not fetch GH stats ', err);
    Q.reject(err);
    return;
  });
};
