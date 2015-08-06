'use strict';

var http = require('https');
var packageJson = require('package-json');

// Failures here should not prevent the list from moving on
module.exports = function (list) {
  this.emit('log', 'Getting downloads for ' + list.length  + ' packages');

  var count = 0;
  var q = this.q;
  var url = 'https://api.npmjs.org/downloads/point/last-month/';

  return this.q.allSettled(list.map(function (plugin) {
    var d = q.defer();
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
    var message = 'Fetched download stats for ' + count +  ' packages';
    var skipped = list.length - count;
    if (skipped){
      message += '. Skipped ' + skipped + ' packages';
    }
    this.emit('log', message);

    return plugins.map(function (item) {
      return item.value;
    });
  }.bind(this));
};
