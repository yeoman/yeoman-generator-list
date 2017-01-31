'use strict';

const npmKeyword = require('npm-keyword');
const blacklist = require('./blacklist');
const log = require('./logger');

module.exports = keyword => {
  log.info('npmKeyword: term: %s', keyword);

  return npmKeyword.names(keyword)
    .then(packages => {
      log.info('npmKeyword: Found %s packages', packages.length);

      return packages.filter(pkg => {
        let valid = pkg.indexOf('generator-') === 0;
        if (!valid) {
          log.warn('npmKeyword: Filtered: invalid name: ' + pkg);
        }

        let blacklisted = valid && blacklist.indexOf(pkg) > -1;
        if (blacklisted) {
          log.warn('npmKeyword: Filtered: blacklisted: ' + pkg);
          valid = false;
        }

        return valid;
      });
    })
    .catch(err => {
      log.error('npmKeyword: Unable to search for keywords ', err);
      throw new Error('npmKeyword: Stop process to prevent a empty list.');
    });
};
