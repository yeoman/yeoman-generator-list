'use strict';

const got = require('got');
const log = require('./logger');

module.exports = list => {
  log.info('DownloadCounts: Getting counts for %s packages', list.length);

  let count = 0;

  return Promise.all(list.map(pkg =>
    got(
      'https://api.npmjs.org/downloads/point/last-month/' + encodeURIComponent(pkg.name), {json: true}
    )
    .then(res => {
      pkg.downloads = res.body.downloads || 0;
      count++;
      return pkg;
    })
    .catch(err => {
      log.warn(
        'DownloadCounts: Could not get counts for %s because %s',
        pkg.name,
        err
      );
      pkg.downloads = 0;
      return pkg;
    })
  ))
  .then(pkgs => {
    let message = 'DownloadCounts: Fetched download stats for %s packages';
    message += '. Skipped %s packages';
    log.info(message, count, list.length - count);

    return pkgs;
  });
};
