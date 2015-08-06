'use strict';

var ghGot = require('gh-got');
var merge = require('./merge-info');

module.exports = function (list, limit) {
  limit = list.length < limit ? list.length : limit;
  this.emit('log', 'Fetching GH stats for ' + limit  + ' packages');

  var count = 0;
  var limitMessage = false;
  var re = /github\.com\/([\w\-\.]+)\/([\w\-\.]+)/i;

  return this.q.allSettled(list.map(function (plugin) {
    var d = this.q.defer();

    if (plugin.repo) {
      var parsedUrl = re.exec(plugin.repo && plugin.repo.replace(/\.git$/, ''));

      if (parsedUrl) {
        plugin.repo = parsedUrl[1] + '/' + parsedUrl[2];
      } else {
        plugin.repo = false;
      }
    }

    if (limit && limit === count && !limitMessage) {
      this.emit('log', 'Limit (' + limit + ') reached for GH API calls');
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
      }, function (err, data, res) {
        count++;
        d.resolve(merge(plugin, data || {}));
      });
    }

    return d.promise;
  }.bind(this)))
  .then(function (plugins) {
    var message = 'Fetched GH stats for ' + count +  ' packages';
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
