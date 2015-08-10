'use strict';

var EventEmitter = require('events').EventEmitter;
var Q = require('q');
var util = require('util');

var getList = require('./src/get');
var updateList = require('./src/update');

var Logger = process.env.LOGGER || {
  log: console.log.bind(console),
  error: console.error.bind(console)
};

var Q = process.env.Q || Q;

var Cache = function () {
  this.list = [];

  this.q = Q;

  this.get = getList.bind(this);
  this.update = updateList.bind(this);

  this.on('log', Logger.log);
  this.on('error', Logger.error);

  updateList.apply(this, arguments);
};

util.inherits(Cache, EventEmitter);

module.exports = Cache;
