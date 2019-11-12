module.exports = api;

var ajax = require('./ajax');

function api(config){

    var base_url = config.base_url;
    var auth = config.auth;

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
