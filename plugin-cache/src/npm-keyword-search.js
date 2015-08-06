'use strict';

var npmKeyword = require('npm-keyword');

module.exports = function (keyword) {
  this.emit('log', 'Starting keyword search: ' + keyword);

  var d = this.q.defer();

  npmKeyword(keyword, function (err, packages) {
    if (err) {
      this.emit('error', 'Unable to search for keywords', err);
      d.reject(err);
      return;
    }

    this.emit('log', 'Found ' + packages.length + ' packages');
    d.resolve(packages);
  }.bind(this));

  return d.promise;
};
