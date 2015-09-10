'use strict';
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var updateList = require('./src/update');

var log = process.env.LOGGER || console;

function createETag(str) {
  var shasum = crypto.createHash('sha1');
  shasum.update(str);
  return shasum.digest('hex');
}

module.exports = function (keyword, limit) {
  if (typeof keyword !== 'string') {
    log.error('Keyword is required');
    return;
  }

  var etag = null;
  var cache = path.join(__dirname, 'cache/cache.json');

  this.getETag = function () {
    return etag;
  };

  this.getCacheStream = function () {
    return fs.createReadStream(cache);
  };

  this.update = function () {
    return updateList(keyword, limit).then(function (data) {
      var json = JSON.stringify(data);
      etag = createETag(json);

      fs.writeFile(cache, json, function () {
        log.info('Updated: %s generators', data.length);
      });
    }).catch(function (err) {
      log.error('Failed to save to cache', err);
    });
  };
};
