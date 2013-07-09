var request = require('request');
var _ = require('lodash');
var Q = require('q');


function createComponentData(name, author, data) {
  return {
    name: name,
    description: data.description,
    owner: author && author.name || data.owner.login,
    ownerWebsite: author.url || data.owner.html_url,
    website: data.html_url,
    forks: data.forks,
    stars: data.watchers,
    created: data.created_at,
    updated: data.updated_at
  };
}

function condensePlugin(plugin) {
  return {
    name: plugin.name,
    author: plugin.author ? plugin.author : '',
    gitURL: plugin.repository ? plugin.repository.url : '',
  };
}

function fetchPluginList() {
  return Q.fcall(function fetchPluginList() {
    var deferred = Q.defer();
    var keyword = 'yeoman-generator';
    var url = 'http://isaacs.iriscouch.com/registry/_design/app/_view/byKeyword?startkey=[%22' +
      keyword + '%22]&endkey=[%22' + keyword + '%22,{}]&group_level=3';
    request({url: url, json: true}, function handlePluginList(error, response, body) {
      if(!error && response.statusCode == 200) {
        deferred.resolve(body.rows);
      } else {
        deferred.reject(new Error(error));
      }
    });
    return deferred.promise;
  }).then(function getPlugin(list) {
      var results = _.map(list, function (item) {
        var deferred = Q.defer();
        var name = item.key[1];
        var url = 'http://isaacs.iriscouch.com/registry/' + name;
        request({url: url, json: true}, function handlePlugin(error, response, body) {
          if (!error && response.statusCode == 200) {
            deferred.resolve(condensePlugin(body));
          } else {
            deferred.reject(new Error(error));
          }
        });
        return deferred.promise;
      });
      return Q.all(results);
  }).then(function getGithubStats(list) {
    // Make sure we have a gitURL.
    var results = _.map(list, function (item) {
      var deferred = Q.defer();
      var re = /github\.com\/([\w\-\.]+)\/([\w\-\.]+)/i;
      var parsedUrl = re.exec(item.gitURL.replace(/\.git$/, ''));
      // only return components from github
      if (!parsedUrl) {
        deferred.resolve();
        return deferred.promise;
      }

      var user = parsedUrl[1];
      var repo = parsedUrl[2];
      var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo;

      request.get(apiUrl, {
        json: true,
        qs: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET
        },
        headers: {
          'User-Agent': 'Node.js'
        }
      }, function (err, response, body) {
        if (!err && response.statusCode === 200) {
          deferred.resolve(createComponentData(item.name, item.author, body));
        } else {
          if (response.statusCode === 404) {
            // don't fail just because the repo doesnt exist
            // instead just return `undefined` and filter it out later
            deferred.resolve();
          } else {
            deferred.reject(new Error('GitHub fetch failed\n' + err + '\n' + body));
          }
        }
        return deferred.promise;
      });
      return deferred.promise;
    });
    return Q.all(results);
  }).then(function filterInvalidValues(generators) {
    // Filter our all null values.
    var results = _.reject(generators, function(val) {
      return val == null;
    });

    return Q.all(results);
  });
}

exports.fetchPluginList = fetchPluginList;
