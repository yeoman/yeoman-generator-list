'use strict';
var crypto = require('crypto');
var Q = require('q');
var connect = require('connect');
var morgan = require('morgan');
var errorhandler = require('errorhandler');
var timeout = require('connect-timeout');
var compression = require('compression');
var pluginCache = require('./');

var HTTP_PORT = process.env.PORT || 8001;

function prepareEntityResponse() {
  return pluginCache.get().then(function (pluginList) {
    var entity = {json: JSON.stringify(pluginList)};
    var shasum = crypto.createHash('sha1');

    shasum.update(entity.json);
    entity.etag = shasum.digest('hex');

    return Q(entity);
  });
}

function serveList(req, res, next) {
  prepareEntityResponse().then(function (entity) {
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
}

pluginCache.start();
var app = connect();

if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler())
}

app.use(morgan('dev'))
  .use(timeout(10000))
  .use(compression())
  .use(serveList);

app.listen(HTTP_PORT);

console.log('Server running on port', HTTP_PORT);
