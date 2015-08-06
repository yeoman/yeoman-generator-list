'use strict';

var packageJson = require('package-json');

module.exports = function (list) {
  this.emit('log', 'Fetching package info for ' + list.length  + ' packages');

  var q = this.q;

  return this.q.allSettled(list.map(function (plugin) {
    var d = q.defer();

    packageJson(plugin.name, function (err, pkg) {
      if (err) {
        this.emit('error', 'Unable to fetch package info for ' + plugin.name, err);
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
    }.bind(this));

    return d.promise;
  }.bind(this)))
  .then(function (plugins) {
    var list = [];

    plugins.forEach(function (plugin) {
      if (plugin.state === 'fulfilled') {
        list.push(plugin.value);
      }
    });

    this.emit('log', 'Fetched info for ' + list.length +  ' packages');
    return list;
  }.bind(this));
};
