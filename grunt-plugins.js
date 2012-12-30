var request = require('request');
var _ = require('underscore');
var Q = require('q');


function condensePlugin(plugin) {
	plugin.keywords = keywords = _.last(_.values(plugin.versions)).keywords;
	delete plugin.versions;
	delete plugin._attachments;
	delete plugin.readme;
	var time = plugin.time;
	delete plugin.time;
	plugin.time = {modified: time.modified, created: time.created};
	return plugin;
}

function fetchPluginList() {
	return Q.fcall(function fetchPluginList() {
		var deferred = Q.defer();
		var keyword = 'gruntplugin';
		var url = 'http://isaacs.iriscouch.com/registry/_design/app/_view/byKeyword?startkey=[%22' +
			keyword + '%22]&endkey=[%22' + keyword + '%22,{}]&group_level=3&limit=10';
		request({url: url, json: true}, function handlePluginList(error, response, body) {
			if(!error && response.statusCode == 200) {
				deferred.resolve(body.rows);
			} else {
				deferred.reject(new Error(error));
			}
		});
		return deferred.promise;
	}).then(function getPlugin(list) {
			var results = [];
			_.each(list, function(item) {
				var deferred = Q.defer();
				results.push(deferred.promise);
				var name = item.key[1];
				var url = 'http://isaacs.iriscouch.com/registry/' + name;
				request({url: url, json: true}, function handlePlugin(error, response, body) {
					if(!error && response.statusCode == 200) {
						deferred.resolve(condensePlugin(body));
					} else {
						deferred.reject(new Error(error));
					}
				});
			});
			return Q.all(results);
		});
}

exports.fetchPluginList = fetchPluginList;
