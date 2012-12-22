var request = require('request');
var _ = require('underscore');
var Q = require('q');

function fetchModuleList( keyword, cb ) {
		var url = 'http://isaacs.iriscouch.com/registry/_design/app/_view/byKeyword?startkey=[%22' +
			keyword + '%22]&endkey=[%22' + keyword + '%22,{}]&group_level=3';
			console.log(url);
			request({url: url, json: true}, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				cb(body.rows);	
			  }
			});

}

fetchModuleList('gruntplugin', function(list) {
	console.log(list.length);
	_.each(list, function(item) {		
		var name = item.key[1];
		console.log(name);
		var url = 'http://isaacs.iriscouch.com/registry/'+name;
		request({url: url, json: true}, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			console.log(JSON.stringify(body, null, '\t'));	
		  }
	  });
	})
});

