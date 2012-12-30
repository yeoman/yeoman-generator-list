const UPDATE_INTERVAL_IN_SECONDS = 60;
const HTTP_PORT = process.env.PORT || 8001;

var http = require('http');
var Q = require('q');
var gruntPlugins = require('./grunt-plugins');
var crypto = require('crypto');


// pluginListEntity - promise {etag: '', json: ''}
// using a promise so that clients can connect and wait for the initial entity
var pluginListEntity = getPluginListEntity();

function getPluginListEntity() {
	var deferred = Q.defer();
	gruntPlugins.fetchPluginList().then(
		function(pluginList) {
			var entity = {
				json: JSON.stringify(pluginList)
			};
			var shasum = crypto.createHash('sha1');
			shasum.update(entity.json);
			entity.etag = shasum.digest('hex');
			deferred.resolve(entity);
			// update the entity
			pluginListEntity = deferred.promise;
		}).fail(function(e) {
			deferred.reject(e);
		});
	return deferred.promise;
}
// Allow Cross-origin resource sharing

var server = http.createServer(function(request, response) {
	// get the plugin list
	pluginListEntity.then(function(entity) {
		response.setHeader('Access-Control-Allow-Origin', '*');
		if(request.headers['if-none-match'] === entity.etag) {
			response.writeHead(304, {"Content-Type": "application/json"});
			response.end();
			return;
		}
		response.setHeader('ETag', entity.etag);
		response.writeHead(200, {"Content-Type": "application/json"});
		response.end(entity.json);
	}).fail(function(e) {
			// something went wrong
			response.setHeader('Access-Control-Allow-Origin', '*');
			response.writeHead(500);
			response.end("Internal server error " + e);

		});
});


// Update function
setInterval(function() {
	getPluginListEntity();
}, UPDATE_INTERVAL_IN_SECONDS * 1000);

server.listen(HTTP_PORT);


console.log('Server running on port ' + HTTP_PORT);
