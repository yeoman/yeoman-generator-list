'use strict';

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var Q = require('q');
var util = require('util');

var Update = require('../src/update');

describe('#get()', function () {
  it('can load', function () {
    assert(typeof Get === 'function');
  });

  describe('Returns a resolved list', function () {
    it('returns prepopulated data', function (done) {
      var compare = [1,2,3];
      var Cache = function () {
        var list = compare;
        this.get = Get.bind(this, list);
      };
      util.inherits(Cache, EventEmitter);

      var cache = new Cache();

      cache.get().then(function (response) {
        assert.equal(response, compare);
        done();
      });
    });

    it('returns emitted data', function (done) {
      var compare = [1,2,3];
      var Cache = function () {
        var list = [];
        this.get = Get.bind(this, list);
      };
      util.inherits(Cache, EventEmitter);

      var cache = new Cache();

      cache.get().then(function (response) {
        assert.equal(response, compare);
        done();
      });
      cache.emit('updated', compare);
    });
  });
});
