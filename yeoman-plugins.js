var request = require('request');
var _ = require('lodash');
var Q = require('q');


function createComponentData(name, data) {
  return {
    name: name,
    description: data.description,
    owner: data.owner.login,
    website: data.html_url,
    forks: data.forks,
    stars: data.watchers,
    created: data.created_at,
    updated: data.updated_at
  };
}

function condensePlugin(plugin) {
	var keywords = keywords = _.last(_.values(plugin.versions)).keywords;
	return {
		name: plugin.name,
		description: plugin.description,
		author: plugin.author,
		url: plugin.url,
		keywords: keywords,
    gitURL: (plugin.repository) ? plugin.repository.url : '',
		// only get created and modified date, leave out all of the version timestamps
		time: {modified: plugin.time.modified, created: plugin.time.created}
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
			var results = _.map(list, function(item) {
				var deferred = Q.defer();
				var name = item.key[1];
				var url = 'http://isaacs.iriscouch.com/registry/' + name;
				request({url: url, json: true}, function handlePlugin(error, response, body) {
					if(!error && response.statusCode == 200) {
						deferred.resolve(condensePlugin(body));
					} else {
						deferred.reject(new Error(error));
					}
				});
				return deferred.promise;
			});
			return Q.all(results);
	}).then(function getGithubStats(list) {
    var results = _.map(list, function(item) {
      var deferred = Q.defer();
      console.log(item);
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
          deferred.resolve(createComponentData(item.name, body));
        } else {
          if (response.statusCode === 404) {
            // uncomment to get a list of registry items pointing
            // to non-existing repos
            //console.log(el.name + '\n' + el.url + '\n');

            // don't fail just because the repo doesnt exist
            // instead just return `undefined` and filter it out later
            deferred.resolve();
          } else {
            deferred.reject(new Error('GitHub fetch failed\n' + err + '\n' + body));
            console.log(err);
            console.log(body);
          }
        }
        return deferred.promise;
      });
      return deferred.promise;
    });
    return Q.all(results);
  });
}

exports.fetchPluginList = fetchPluginList;
