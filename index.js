'use strict';

var Q = require('q');
var npmKeyword = require('npm-keyword');
var packageJson = require('package-json');
var ghGot = require('gh-got');
var EventEmitter = require('events').EventEmitter;

var UPDATE_INTERVAL_IN_SECONDS = 60 * 60 + 1;


function createComponentData(npm, gh) {
  gh = gh || {
    description: '',
    owner: {
      login: '',
      html_url: '',
    },
    html_url: '',
    stargazers_count: '',
    watchers_count: ''
  };

  var description = npm.description && gh.description ? (
    npm.description.length > gh.description.length ?
      npm.description : gh.description
    ) : npm.description || gh.description || '';

  return {
    name: npm.name,
    description: description,
    stars: gh.stargazers_count || gh.watchers_count,
    website: npm.website || gh.html_url,
    owner: npm.author && npm.author.name || gh.owner.login,
    ownerWebsite: npm.author && npm.author.url || gh.owner.html_url,
  };
}

function condenseMeta(pkg) {
  return {
    name: pkg.name,
    description: pkg.description,
    author: pkg.author,
    website: pkg.homepage,
    repo: pkg.repository && pkg.repository.type === 'git' ?
      pkg.repository.url : false
  };
}

function promiseCallback (promise, transform) {
  return function (err, data) {
    if (err) {
      promise.reject(err);
      return;
    }
    promise.resolve(transform ? transform(data) : data);
  };
}

function getNpmPackageList() {
  console.log('Querying for keywords');
  var d = Q.defer();
  npmKeyword(
    process.env.NPM_LIST_KEYWORD || 'yeoman-generator',
    promiseCallback(d)
  );
  return d.promise;
}

function getNpmPackages(list) {
  console.log('Getting ' + list.length + ' packages');
  return Q.all(list.map(function (el) {
    var d = Q.defer();
    packageJson(
      el.name,
      promiseCallback(d, condenseMeta)
    );
    return d.promise;
  }));
}

function getGithubStats(list) {
  console.log('Getting GH stats');
  return Q.allSettled(list.map(function (el) {
    var d = Q.defer();

    if (el.repo) {
      var re = /github\.com\/([\w\-\.]+)\/([\w\-\.]+)/i;
      var parsedUrl = re.exec(el.repo && el.repo.replace(/\.git$/, ''));

      if (parsedUrl) {
        el.repo = parsedUrl[1] + '/' + parsedUrl[2];
      } else {
        el.repo = false;
      }
    }

    if (!el.repo) {
      d.resolve(createComponentData(el));
    } else {
      ghGot('repos/' + el.repo, {
        query: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET
        },
        headers: {
          'user-agent': 'https://github.com/yeoman/yeoman-generator-list'
        }
      }, function (err, data, res) {
        if (err) {
          if (err.code === 404 || err.code === 403) {
            d.resolve(createComponentData(el));
          } else {
            d.reject(new Error('GitHub fetch failed\n' + err + '\n' + data));
          }
        } else {
          d.resolve(createComponentData(el, data));
        }
      });
    }

    return d.promise;
  }));
}

module.exports = {
  pluginList: null,
  hub: new EventEmitter(),

  start: function () {
    this.update();
  },

  update: function () {
    console.log('Updating the list');
    Q.fcall(getNpmPackageList)
      .then(getNpmPackages)
      .then(getGithubStats)
      .then(function (pluginList) {
        console.log('Processing ' + pluginList.length + ' plugins');
        this.pluginList = [];
        pluginList.forEach(function(plugin) {
          if (plugin.state === 'fulfilled') {
            this.pluginList.push(plugin.value);
          }
        }.bind(this));
        console.log('List updated: ' + this.pluginList.length + ' results');
        this.hub.emit('update', this.pluginList);
        setTimeout(this.update.bind(this), UPDATE_INTERVAL_IN_SECONDS * 1000);
      }.bind(this))
      .catch(function (err) {
        console.log('Error while fetching list', err);
      });
  },

  get: function (cb) {
    var d = Q.defer();

    if (this.pluginList) {
      d.resolve(this.pluginList);
    } else {
      this.hub.on('update', function (pluginList) {
        d.resolve(pluginList);
      });
    }

    return d.promise;
  }
};
