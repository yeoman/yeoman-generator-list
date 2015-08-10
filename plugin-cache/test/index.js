'use strict';

var assert = require('assert');
var Cache = require('..');

// TODO mock out network call for packages

describe('Cache', function () {
  this.timeout(20000);

  beforeEach(function (done) {
    this.pluginCache = new Cache('yeoman-generator', 20);
    this.pluginCache.on('updated', function () {
      done();
    });
  });

  it.only('can load', function () {
    assert(typeof Cache === 'function');
    assert(typeof this.pluginCache === 'object');
  });

  describe('Properties', function () {
    it('provides a get function', function () {
      assert(typeof this.pluginCache.get === 'function');
    });

    it('provides a update function', function () {
      assert(typeof this.pluginCache.update === 'function');
    });

    it('does not expose the list', function () {
      assert(typeof this.pluginCache.list === 'undefined');
    });
  });

  describe('Events', function () {
    it('can attach event listeners', function (done) {
      this.pluginCache.on('init', function () {
        assert(true);
        done();
      });
      this.pluginCache.emit('init');
    });
  });
});
