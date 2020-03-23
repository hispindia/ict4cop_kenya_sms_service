module.exports = api;

var ajax = require('./ajax');

function api(config){

    var base_url = config.dhis2.url;
    var auth = "Basic "+Buffer.from(config.dhis2.username+":"+config.dhis2.password).toString('base64');;


    this.getObj = function(endpoint,callback){
        ajax.getReq(base_url+"/api/"+endpoint,auth,callback);
    }

    this.save = function(endpoint,obj,callback){
        ajax.postReq(base_url+"/api/"+endpoint,obj,auth,callback);
    }

    this.update = function(endpoint,obj,callback){
        ajax.putReq(base_url+"/api/"+endpoint,obj,auth,callback);
    }

    
    this.postReq = function(endpoint,obj,headers,callback){
        
        ajax.postReq(base_url + endpoint,
                     obj,
                     auth,
                     function(error,body,response){
                         if (error){
                             callback(error);
                             return;
                         }
                         
                         callback(null,response)                        
                     });            
    }

  
    
}
