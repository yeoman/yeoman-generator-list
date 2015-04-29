'use strict';
var crypto = require('crypto');
var Q = require('q');
var connect = require('connect');
var morgan = require('morgan');
var errorhandler = require('errorhandler');
var timeout = require('connect-timeout');
var fetchGeneratorList = require('./');

// update once every hour
var UPDATE_INTERVAL_IN_SECONDS = 60 * 60;
var HTTP_PORT = process.env.PORT || 8001;

function getPluginListEntity() {
  return fetchGeneratorList().then(function (pluginList) {
    var entity = {json: JSON.stringify(pluginList)};
    var shasum = crypto.createHash('sha1');

    shasum.update(entity.json);
    entity.etag = shasum.digest('hex');

    return Q(entity);
  });
}

// pluginListEntity - promise {etag: '', json: ''}
// using a promise so that clients can connect and wait for the initial entity
var pluginListEntity = getPluginListEntity();

// update function
setInterval(getPluginListEntity, UPDATE_INTERVAL_IN_SECONDS * 1000);

connect()
  .use(morgan('dev'))
  .use(errorhandler())
  .use(timeout(10000))
  .use(function (req, res, next) {
    // get the plugin list
    pluginListEntity.then(function (entity) {
      // Allow Cross-origin resource sharing
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('ETag', entity.etag);
      if (req.headers['if-none-match'] === entity.etag) {
        res.statusCode = 304;
        res.end();
        return;
      }
      res.statusCode = 200;
      res.end(new Buffer(entity.json));
    }).fail(next);
  })
  .listen(HTTP_PORT);

console.log('Server running on port', HTTP_PORT);
