'use strict';

var Q = require('q');
var http = require('http');

var log = process.env.LOGGER || console;

module.exports = function (list) {
  log.info('Filtering packages from the blacklist');

  var d = Q.defer();

  http.get('http://yeoman.io/blacklist.json', function(res) {
    var blacklist = '';
    res.on('data', function (data) {
      blacklist += data;
    });
    res.on('end', function () {
      try {
        blacklist = JSON.parse(blacklist);
      }
      catch (e) {
        blacklist = [];
        log.error('Could not parse the blacklist', e);
      }

      list = list.filter(function(item) {
        return blacklist.indexOf(item.name) < 0;
      });

      return d.resolve(list);
    });
    res.on('error', function (err) {
      log.error('Could not parse the blacklist', e);
      d.resolve(list);
    });
  });

  return d.promise;
};
