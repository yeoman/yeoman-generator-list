'use strict';

const moment = require('moment');
const got = require('got');
const pMap = require('p-map');
const log = require('./logger');

module.exports = list => {
  log.info('npmsInfo: Fetching info for %s packages', list.length);

  return pMap(list, fetchInfos, {concurrency: 2})
    .then(pkgs => {
      pkgs = pkgs.filter(pkg => Boolean(pkg));
      log.info('npmInfo: Fetched info for %s valid packages', pkgs.length);

      return pkgs;
    })
    .catch(err => {
      console.error(err);
    });
};

function fetchInfos(pkg) {
  log.info(`\tFetch info for ${pkg}`);

  return got(`https://api.npms.io/v2/package/${pkg}`, {
    json: true,
    headers: {
      'user-agent': 'https://github.com/yeoman/yeoman-generator-list'
    }
  })
    .then(response => {
      const metadata = response.body.collected.metadata;
      const npm = response.body.collected.npm;
      const github = response.body.collected.github || {};

      let ownerWebsite = metadata.author && metadata.author.url;
      ownerWebsite = ownerWebsite || (metadata.links.repository && metadata.links.repository.replace(`/${pkg}`, ''));
      ownerWebsite = ownerWebsite || '';

      const formattedPkg = {
        description: cleanupDescription(metadata.description || ''),
        downloads: npm.downloads[2].count,
        name: metadata.name.replace(/^generator-/, '').trim(),
        official: (metadata.links.repository && metadata.links.repository.includes('https://github.com/yeoman/')) || false,
        owner: {
          name: (metadata.author && metadata.author.name) || '',
          site: ownerWebsite
        },
        site: metadata.links.homepage || metadata.links.repository || '',
        stars: github.starsCount || 0,
        timeSince: moment(metadata.date).fromNow(),
        updated: metadata.date
      };

      return formattedPkg;
    })
    .catch(err => {
      log.warn(
        'npmsInfo: Could not fetch info for %s package because %s',
        pkg,
        err
      );
      return false;
    });
}

function cleanupDescription(str) {
  str = str.trim()
    // Remove GitHub emojis
    .replace(/:\w+:/, '')
    .replace(/ ?generator for (?:yeoman|yo) ?/i, '')
    .replace(/(?:a )?(?:yeoman|yo) (?:generator (?:for|to|that|which)?)?/i, '')
    .replace(/(?:yeoman|yo) generator$/i, '')
    .replace(/ ?application ?/i, 'app')
    .trim()
    .replace(/\.$/, '');
  str = str.charAt(0).toUpperCase() + str.slice(1);

  return str;
}
