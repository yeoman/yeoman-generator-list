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
      throw Error(msg);
    }

    return update(keyword)
    .then(data => {
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
      return err;
    });
  }
};
