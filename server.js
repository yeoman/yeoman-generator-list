'use strict';

/* Libraries */
var compression = require('compression');
var connect = require('connect');
var crypto = require('crypto');
var errorhandler = require('errorhandler');
var morgan = require('morgan');
var pluginCache = require('./plugin-cache');
var timeout = require('connect-timeout');


/* env Variables */
var nodeEnv = process.env.NODE_ENV || 'development';
var envDev = nodeEnv === 'development';
var npmListKeyword = process.env.NPM_LIST_KEYWORD || 'yeoman-generator';
var apiLimit = process.env.NPM_LIST_LIMIT || (envDev ? 100 : 5000);
var httpPort = process.env.PORT || (envDev ? 8001 : 80);
var updateInterval = process.env.UPDATE_INTERVAL_IN_SECONDS || 3610;

/* Helper functions */
function createETagForPluginList(pluginList) {
  var shasum = crypto.createHash('sha1');
  shasum.update(JSON.stringify(pluginList));
  return shasum.digest('hex');
}

function serveList(req, res, next) {
  pluginCache.get().then(function (pluginList) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    var etag = createETagForPluginList(pluginList);
    res.setHeader('ETag', etag);
    if (req.headers['if-none-match'] === etag) {
      res.statusCode = 304;
      res.end();
      return;
    }

    res.statusCode = 200;
    res.end(new Buffer(JSON.stringify(pluginList)));
  }).fail(next);
}

/* Plugin Cache operations */
var pluginCache = new pluginCache(npmListKeyword, apiLimit);
pluginCache.on('updated', function (data) {
  setTimeout(function () {
    pluginCache.update(npmListKeyword, apiLimit)
  }, updateInterval * 1000);
});


/* Server Setup */
var app = connect();
if (envDev) {
  app.use(errorhandler())
}
app.use(morgan('dev'))
  .use(timeout(10000))
  .use(compression())
  .use(serveList);
app.listen(httpPort);
console.log('Server running on port', httpPort);
