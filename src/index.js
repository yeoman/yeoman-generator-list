'use strict';
const crypto = require('crypto');
const update = require('./update');
const log = require('./logger');

module.exports = {
  log: log,
  update: keyword => {
    if (typeof keyword !== 'string') {
      let msg = 'Index: Keyword is required';
      log.error(msg);
      throw new Error(msg);
    }

    return update(keyword)
    .then(data => {
      if (data.length === 0) {
        throw new Error('Index: date length = 0');
      }
      log.info('Index: updated %s generators', data.length);
      data = JSON.stringify(data);
      let shasum = crypto.createHash('sha1');
      shasum.update(data);

      return {
        data: data,
        etag: shasum.digest('hex')
      };
    })
    .catch(err => {
      log.error('Index: Failed to save to cache', err);
      process.exit(1); // eslint-disable-line unicorn/no-process-exit
    });
  }
};
