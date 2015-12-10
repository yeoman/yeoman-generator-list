'use strict';
if (process.env.NEW_RELIC_ENABLED) {
  require('newrelic');
}
var compression = require('compression');
var connect = require('connect');
var errorhandler = require('errorhandler');
var morgan = require('morgan');
var pluginCache = require('./plugin-cache');
var timeout = require('connect-timeout');

// Set higher maximum http sockets
require('http').globalAgent.maxSockets = 100;
require('https').globalAgent.maxSockets = 100;

/* env Variables */
var nodeEnv = process.env.NODE_ENV || 'development';
var envDev = nodeEnv === 'development';
var npmListKeyword = process.env.NPM_LIST_KEYWORD || 'yeoman-generator';
var apiLimit = process.env.NPM_LIST_LIMIT || (envDev ? 100 : 5000);
var httpPort = process.env.PORT || (envDev ? 8001 : 80);
var updateInterval = process.env.UPDATE_INTERVAL_IN_SECONDS || 3610;
var log = process.env.LOGGER || console;


function serveList(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  var etag = Plugins.getETag();
  res.setHeader('ETag', etag);
  if (req.headers['if-none-match'] === etag) {
    res.statusCode = 304;
    res.end();
    return;
  }

  res.statusCode = 200;
  Plugins.getCacheStream().pipe(res);
}

/* Plugin Cache operations */
var Plugins = new pluginCache(npmListKeyword, apiLimit);
var update = function () {
  Plugins.update().finally(function () {
    setTimeout(update, updateInterval * 1000);
  });
};
update();

/* Server Setup */
var app = connect();
if (envDev) {
  app.use(errorhandler());
}
app.use(morgan('dev'))
  .use(timeout(10000))
  .use(compression())
  .use(serveList);
app.listen(httpPort);
log.info('Server running on port %s', httpPort);
