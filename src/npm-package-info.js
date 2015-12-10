'use strict';

const packageJson = require('package-json');
const log = require('./logger');

module.exports = list => {
  log.info('npmInfo: Fetching info for %s packages', list.length);

  return Promise.all(list.map(pkg =>
    packageJson(pkg)
    .then(pkg => ({
      author: pkg.author,
      description: pkg.description,
      name: pkg.name,
      repo: pkg.repository && pkg.repository.type === 'git' ?
        pkg.repository.url : false,
      website: pkg.homepage || false,
      updated: pkg.time.modified || pkg.time.created || ''
    }))
    .catch(err => {
      log.warn(
        'npmInfo: Could not fetch info for %s package because %s',
        pkg,
        err
      );
      return false;
    })
  ))
  .then(pkgs => {
    pkgs = pkgs.filter(pkg => Boolean(pkg));
    log.info('npmInfo: Fetched info for %s valid packages', pkgs.length);
    return pkgs;
  });
};
