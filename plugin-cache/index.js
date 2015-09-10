'use strict';

var updateList = require('./src/update');

var log = process.env.LOGGER || console;

module.exports = function (keyword, limit) {
  if (typeof keyword !== 'string') {
    log.error('Keyword is required');
    return;
  }

  var list = [];

  this.get = function () {
    return list;
  };

  this.update = function () {
    return updateList(keyword, limit).then(function (data) {
      log.info('Updated: %s generators', data.length);
      list = data;
    });
  };
};
