var specHelper = require('../_specHelper.js').specHelper;
var suite = specHelper.vows.describe('cache tests');
var apiObj = {};

suite.addBatch({
  'specHelper.prepare':{
    topic: function(){
      var cb = this.callback;
      specHelper.prepare(function(api){
        apiObj = api;
        cb();
      })
    },
    'api object should exist': function(){ specHelper.assert.isObject(apiObj); },
  }
});

suite.addBatch({
	"api.cache": {
    	topic: function(){ return apiObj },
    	'should exist: objects' : function(api){ specHelper.assert.isObject(api.cache); },
    	'should exist: save' : function(api){ specHelper.assert.isFunction(api.cache.save); },
    	'should exist: destroy' : function(api){ specHelper.assert.isFunction(api.cache.destroy); },
    	'should exist: load' : function(api){ specHelper.assert.isFunction(api.cache.load); },
    	'should exist: exists' : function(api){ specHelper.assert.isFunction(api.cache.exists); }
	},
});

suite.addBatch({
	"cache.save": {
    	topic: function(){ apiObj.cache.save(apiObj,"testKey","abc123",null,this.callback) },
    	saved: function(resp, f){ specHelper.assert.equal(resp, "new record"); }
	},
});

suite.addBatch({
	"cache.save again": {
    	topic: function(){ apiObj.cache.save(apiObj,"testKey","abc123",null,this.callback) },
    	save: function(resp, f){ specHelper.assert.equal(resp, "updated record"); }
	},
});

suite.addBatch({
	"cache.exists sucess": {
    	topic: function(){ apiObj.cache.exists(apiObj,"testKey",this.callback) },
    	save: function(resp, f){ specHelper.assert.isTrue(f); } // use f because truth is propigated down by vows
	},
});

suite.addBatch({
	"cache.exists fail": {
    	topic: function(){ apiObj.cache.exists(apiObj,"something else",this.callback) },
    	save: function(resp, f){ specHelper.assert.isFalse(f); } // use f because truth is propigated down by vows
	},
});


suite.addBatch({
	"cache.load sucess": {
    	topic: function(){ apiObj.cache.load(apiObj,"testKey",this.callback) },
    	save: function(resp, f){ specHelper.assert.equal(resp, "abc123"); }
	},
});

suite.addBatch({
	"cache.load fail": {
    	topic: function(){ apiObj.cache.load(apiObj,"something else",this.callback) },
    	save: function(resp, f){ specHelper.assert.equal(resp, null); }
	},
});

suite.addBatch({
	"cache.destroy sucess": {
    	topic: function(){ apiObj.cache.destroy(apiObj,"testKey",this.callback) },
    	save: function(resp, f){ specHelper.assert.equal(f, true); }
	},
});

suite.addBatch({
	"cache.destroy fail": {
    	topic: function(){ apiObj.cache.destroy(apiObj,"testKey",this.callback) },
    	save: function(resp, f){ specHelper.assert.equal(f, false); }
	},
});

// mess with expire time
suite.addBatch({
	"cache.save expire time win": {
    	topic: function(){ apiObj.cache.save(apiObj,"testKey_slow","abc123",100,this.callback) },
    	saved: function(resp, f){ specHelper.assert.equal(resp, "new record"); }
	},
});
suite.addBatch({
	"cache.load expire time win": {
    	topic: function(){ apiObj.cache.load(apiObj,"testKey_slow",this.callback) },
    	save: function(resp, f){ specHelper.assert.equal(resp, "abc123"); }
	},
});
suite.addBatch({
	"cache.save expire time fail": {
    	topic: function(){ apiObj.cache.save(apiObj,"testKey_slow","abc123",0,this.callback) },
    	saved: function(resp, f){ specHelper.assert.equal(resp, "updated record"); }
	},
});
suite.addBatch({
	"cache.load expire time fail": {
    	topic: function(){ apiObj.cache.load(apiObj,"testKey_slow",this.callback) },
    	save: function(resp, f){ specHelper.assert.equal(resp, null); }
	},
});

// mess with object types to save
suite.addBatch({
	"cache.save array": {
    	topic: function(){ apiObj.cache.save(apiObj,"array_key",[1,2,3],null,this.callback) },
    	saved: function(resp, f){ specHelper.assert.equal(resp, "new record"); }
	},
});
suite.addBatch({
	"cache.load array": {
    	topic: function(){ apiObj.cache.load(apiObj,"array_key",this.callback) },
    	save: function(resp, f){
			specHelper.assert.isArray(resp);
			specHelper.assert.equal(resp[0], 1);  
			specHelper.assert.equal(resp[1], 2);  
			specHelper.assert.equal(resp[2], 3);  
		}
	},
});

suite.addBatch({
	"cache.save array": {
    	topic: function(){ 
			var data = {};
			data.thing = "stuff";
			data.otherThing = [1,2,3];
			apiObj.cache.save(apiObj,"obj_key",data,null,this.callback) 
		},
    	saved: function(resp, f){ specHelper.assert.equal(resp, "new record"); }
	},
});
suite.addBatch({
	"cache.load array": {
    	topic: function(){ apiObj.cache.load(apiObj,"obj_key",this.callback) },
    	save: function(resp, f){
			specHelper.assert.isObject(resp);
			specHelper.assert.equal(resp.thing, "stuff");  
			specHelper.assert.isArray(resp.otherThing);
			specHelper.assert.equal(resp.otherThing[0], 1); 
		}
	},
});


// export
suite.export(module);