'use strict';

const moment = require('moment');

module.exports = (npm, gh) => {
  gh = gh || {};
  let ownerWebsite = npm.author && npm.author.url;
  ownerWebsite = ownerWebsite || gh.owner && gh.owner.html_url;
  ownerWebsite = ownerWebsite || '';

  return {
    description: cleanupDescription(npm.description || gh.description || ''),
    downloads: npm.downloads,
    name: npm.name.replace(/^generator-/, '').trim(),
    official: ownerWebsite && ownerWebsite === 'https://github.com/yeoman',
    owner: {
      name: npm.author && npm.author.name || gh.owner && gh.owner.login || '',
      site: ownerWebsite
    },
    site: npm.website || gh.html_url || '',
    stars: gh.stargazers_count || 0,
    timeSince: moment(npm.updated).fromNow(),
    updated: npm.updated
  };
};

function cleanupDescription(str) {
  if (!str) {
    return '';
  }

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
