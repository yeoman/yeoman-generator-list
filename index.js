'use strict';
if (process.env.NEW_RELIC_ENABLED) {
  require('newrelic');
}

/* env Variables */
var nodeEnv = process.env.NODE_ENV || 'development';
var envDev = nodeEnv === 'development';
var npmListKeyword = process.env.NPM_LIST_KEYWORD || 'yeoman-generator';
var apiLimit = process.env.NPM_LIST_LIMIT || (envDev ? 100 : 5000);
var updateInterval = process.env.UPDATE_INTERVAL_IN_SECONDS || 3610;
var projectId = process.env.GCLOUD_PROJECT_ID || 'yo-gen-list';
var bucket = process.env.GCLOUD_BUCKET || 'yeoman-generator-list';
var keyFilename = process.env.GCLOUD_KEYFILENAME;
var log = process.env.LOGGER || console;

var gcloud = require('gcloud');
var PluginCache = require('./plugin-cache');

var gconfig = {
  projectId: projectId
};
if (keyFilename) {
  gconfig.keyFilename = keyFilename;
}
bucket = gcloud(gconfig).storage().bucket(bucket);

/* Plugin Cache operations */
var Plugins = new PluginCache(npmListKeyword, apiLimit);
var update = function () {
  Plugins.update().finally(function () {
    var file = bucket.file('cache.json');
    Plugins.getCacheStream()
    .pipe(file.createWriteStream({
      gzip: true,
      metadata: {
        contentType: 'application/json',
        metadata: {
          ETag: Plugins.getETag()
        }
      }
    }))
    .on('error', function (err) {
      log.error('Error publishing the list: ', err);
    })
    .on('finish', function () {
      log.info('Pushed cache to CDN');
    });

    setTimeout(update, updateInterval * 1000);
  });
};
update();
