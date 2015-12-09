/* eslint-disable camelcase */
'use strict';

const gh = require('github-url-to-object');
const ghGot = require('gh-got');
const merge = require('./merge-info');
const log = require('./logger');

module.exports = (list, limit) => {
  limit = limit || list.length;
  limit = list.length < limit ? list.length : limit;
  log.info('GHStats: Fetching stats for %s packages', limit);

  let count = 0;

  return Promise.all(list.map(pkg => {
    if (pkg.repo) {
      let url = gh(pkg.repo);

      if (url && url.user && url.repo) {
        pkg.repo = url.user + '/' + url.repo;
      } else {
        pkg.repo = false;
      }
    }

    if (!pkg.repo) {
      return merge(pkg);
    }

    if (--limit < 1) {
      if (limit === 0) {
        log.info('GHStats: Limit reached for GH API calls');
      }
      return merge(pkg);
    }

    count++;
    return ghGot('repos/' + pkg.repo, {
      query: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET
      },
      headers: {
        'user-agent': 'https://github.com/yeoman/yeoman-generator-list'
      }
    })
    .then(res => merge(pkg, res.body))
    .catch(err => {
      log.warn(
        'GHStats: Could not fetch stats for %s package because %s (url: %s)',
        pkg.name,
        (err && (err.message || err.statusCode)) || err,
        pkg.repo
      );
      count--;
      return merge(pkg);
    });
  }))
  .then(pkgs => {
    let message = 'GHStats: Fetched stats for %s packages';
    message += '. Skipped %s packages';
    log.info(message, count, list.length - count);

    let total = pkgs.length;
    pkgs = pkgs.filter(pkg => Boolean(pkg.description.trim()));
    let invalid = pkgs.length - total;
    if (invalid > 0) {
      log.info('GHStats: Filtered out %s bad description packages', invalid);
    }

    return pkgs;
  });
};
