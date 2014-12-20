// Update once every hour
const UPDATE_INTERVAL_IN_SECONDS = 60*60;
const HTTP_PORT = process.env.PORT || 8001;

var http = require('http');
var Q = require('q');
var yeomanPlugins = require('./yeoman-generators');
var crypto = require('crypto');
var connect = require('connect');
var morgan = require('morgan');
var errorhandler = require('errorhandler');
var timeout = require('connect-timeout');


// pluginListEntity - promise {etag: '', json: ''}
// using a promise so that clients can connect and wait for the initial entity
var pluginListEntity = getPluginListEntity();

function getPluginListEntity() {
  var deferred = Q.defer();
  yeomanPlugins.fetchPluginList().then(
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
// Update function
setInterval(function() {
  getPluginListEntity();
}, UPDATE_INTERVAL_IN_SECONDS * 1000);

var app = connect()
  .use(morgan('dev'))
  .use(errorhandler())
  .use(timeout(10000))
  .use(function(request, response, next) {
    // get the plugin list
    pluginListEntity.then(function(entity) {
      // Allow Cross-origin resource sharing
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader("Content-Type", "application/json");
      response.setHeader('ETag', entity.etag);
      if(request.headers['if-none-match'] === entity.etag) {
        response.statusCode = 304;
        response.end();
        return;
      }
      response.statusCode = 200;
      response.end(new Buffer(entity.json));
    }).fail(function(e) {
        // something went wrong
        next(e);
      })
  })
  .listen(HTTP_PORT);


console.log('Server running on port ' + HTTP_PORT);
