'use strict';

module.exports = function (npm, gh) {
  gh = gh || {};

  var description;
  if (npm.description && gh.description) {
    if (npm.description.length > gh.description.length) {
      description = npm.description;
    } else {
      description = gh.description;
    }
  } else {
    description = npm.description || gh.description;
  }

  var ownerWebsite = npm.author && npm.author.url
  ownerWebsite = ownerWebsite || gh.owner && gh.owner.html_url;

  return {
    name: npm.name,
    description: description || '',
    stars: gh.stargazers_count || 0,
    downloads: npm.downloads,
    website: npm.website || gh.html_url || '',
    owner: npm.author && npm.author.name || gh.owner && gh.owner.login || '',
    ownerWebsite: ownerWebsite || '',
  };
};
