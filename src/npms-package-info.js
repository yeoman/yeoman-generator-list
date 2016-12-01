'use strict';

const moment = require('moment');
const got = require('got');
const pMap = require('p-map');

const log = require('./logger');

const NPMS_MAX_PKG = 250; // https://github.com/npms-io/npms-api/blob/master/lib/routes/package/info.js#L147

module.exports = list => {
  log.info(`npmsInfo: Fetching info for ${list.length} packages split into group of ${NPMS_MAX_PKG} elements`);
  const groupsPkg = [];
  const currentDate = new Date();

  while (list.length) {
    groupsPkg.push(list.splice(0, NPMS_MAX_PKG));
  }

  return pMap(groupsPkg, fetchInfos)
    .then(formattedGroupsPkg => {
      formattedGroupsPkg = [].concat(...formattedGroupsPkg);

      formattedGroupsPkg = formattedGroupsPkg.filter(pkg => Boolean(pkg));

      log.info(`npmsInfo: Fetched info for ${formattedGroupsPkg.length} valid packages ${moment().from(currentDate)}`);

      return formattedGroupsPkg;
    });
};

function fetchInfos(groupPkg) {
  return got.post('https://api.npms.io/v2/package/mget', {
    body: JSON.stringify(groupPkg),
    json: true,
    headers: {
      'User-Agent': 'https://github.com/yeoman/yeoman-generator-list',
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      return Object.keys(response.body).map(pkgName => {
        const pkg = response.body[pkgName];

        const metadata = pkg.collected.metadata;
        const npm = pkg.collected.npm;
        const github = pkg.collected.github || {};

        let ownerWebsite = metadata.author && metadata.author.url;
        ownerWebsite = ownerWebsite || (metadata.links.repository && metadata.links.repository.replace(`/${metadata.name}`, ''));
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
      });
    })
    .catch(err => {
      log.warn(`npmsInfo: Could not fetch info because ${err}`);
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
