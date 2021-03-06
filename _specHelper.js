var specHelper = {}

specHelper.vows = require('vows');
specHelper.net = require('net');
specHelper.assert = require('assert');
specHelper.request = require('request');
specHelper.api = {};

specHelper.url = "127.0.0.1";

specHelper.params = {
	"database" : {
		"host" : specHelper.url,
		"database" : "action_hero_api_test",
		"username" : "root",
		"password" : null,
		"port" : "3306",
		"consoleLogging" : false,
	},
	"flatFileDirectory":"./public/",
	"webServerPort" : 8081,
	"socketServerPort" : 5001,
	"logging":false,
	"cronProcess":false,
	"cache" : {
		"defaultExpireTimeSeconds" : 3600
	},
};

specHelper.tables = [
	"Caches", "Logs", "Sessions"
];

specHelper.prepare = function(next){
	specHelper.cleanDB(function(){
		specHelper.startServer(function(api){
			next(api);
		});
	});
}

////////////////////////////////////////////////////////////////////////////
// Start Test Server
specHelper.startServer = function(next){
	var conn = specHelper.net.createConnection(specHelper.params.webServerPort, host='127.0.0.1', function(){
		next(specHelper.api);
		conn.destroy();
	});
	conn.on('error', function(err) { 
		if(err.code == "ECONNREFUSED"){
			console.log(" >> starting test actionHero server on ports "+specHelper.params.webServerPort+" (webServerPort) and "+specHelper.params.socketServerPort+" (socketServerPort)");
			console.log(" >> using test database: "+specHelper.params.database.database);
			console.log("");
			var actionHero = require(__dirname + "/api.js").actionHero;
			actionHero.start({configChanges: specHelper.params}, function(api){
				// console.log("test server started");
				specHelper.api = api;
				next(api);
			});
		}else{
			next(api);
		}
		conn.destroy();
	}); 
}

////////////////////////////////////////////////////////////////////////////
// Clean Test DB
specHelper.cleanDB = function(next){
	var mysql = require('mysql');
	var mySQLparams = {
	  user: specHelper.params.database.username,
	  password: specHelper.params.database.password,
	  port: specHelper.params.database.port,
	  host: specHelper.params.database.host,
	  database: specHelper.params.database.database,
	};
	rawDBConnction = mysql.createClient(mySQLparams);

	var running = 0;
	for(var i in specHelper.tables){
		running++;
		rawDBConnction.query('TRUNCATE '+ specHelper.tables[i], function(err, rows, fields){
			running--
			if(running == 0){
				// console.log("test DB Truncated");
				next();
			}
		});
	}
}

////////////////////////////////////////////////////////////////////////////
// API request
specHelper.apiTest = {
  general: function(method, url, data, cb){
  	var params = {}
  	params.method = method;
  	params.url = "http://"  + specHelper.url + ":" + specHelper.params.webServerPort + (url||'') + "?";
  	for(var i in data){
  		params.url += i + "=" + data[i] + "&";
  	}
    specHelper.request(params,function(req, res){
        try{ res.body = JSON.parse(res.body); }catch(e){};
        cb( res );
      })
  },
  get: function( url, data, cb  ){ specHelper.apiTest.general( 'GET', url, data, cb    )  },
  post: function( url, data, cb ){ specHelper.apiTest.general( 'POST', url, data, cb   )  },
  put: function( url, data, cb  ){ specHelper.apiTest.general( 'PUT', url, data, cb    )  },
  del: function( url, data, cb  ){ specHelper.apiTest.general( 'DELETE', url, data, cb )  }
}

////////////////////////////////////////////////////////////////////////////
// API object cleanup
specHelper.cleanAPIObject = function(api){
	var cleanAPI = {}
	cleanAPI["actions"] = api["actions"];
	cleanAPI["tasks"] = api["tasks"];
	cleanAPI["utils"] = api["utils"];
	cleanAPI["configData"] = api["configData"];
	cleanAPI["stats"] = api["stats"];
	cleanAPI["cache"] = api["cache"];
	cleanAPI["postVariables"] = api["postVariables"];
	return cleanAPI
}

////////////////////////////////////////////////////////////////////////////
// EXPORT
exports.specHelper = specHelper;