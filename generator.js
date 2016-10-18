'use strict';

if (process.env.NEW_RELIC_APP_NAME && process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

/* env Variables */
const npmListKeyword = process.env.NPM_LIST_KEYWORD || 'yeoman-generator';
const updateInterval = process.env.UPDATE_INTERVAL_IN_SECONDS || 3610;

/* Google Cloud Storage Variables */
const bucket = require('gcloud').storage({
  projectId: process.env.GCLOUD_PROJECT_ID || 'yo-gen-list',
  keyFilename: process.env.GCLOUD_KEYFILENAME || 'auth.json'
}).bucket(process.env.GCLOUD_BUCKET || 'generators.yeoman.io');

/* Actual generator files */
const List = require('./src');

/* List operations */
(function update() {
  // Be able to run this again
  let runTimeout = () => setTimeout(update, updateInterval * 1000);

  List.update(npmListKeyword)
  .then(response => {
    bucket.file('cache.json').createWriteStream({
      gzip: true,
      metadata: {
        contentType: 'application/json',
        metadata: {
          ETag: response.etag
        }
      }
    })
    .on('error', err => {
      List.log.error('Cloud: Error publishing the list: ', err);
      runTimeout();
    })
    .on('finish', () => {
      List.log.info('Cloud: Pushed cache to CDN');
      runTimeout();
    }).end(response.data);
  })
  .catch(runTimeout);
})();
