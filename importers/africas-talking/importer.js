module.exports = new importer();

var ajax = require('../../ajax')
var converter = require('./converter');
var config = require('../../config.json');


var constants = [];
var constantCodeMap = [];

var auth = "Basic "+Buffer.from(config.dhis2.username+":"+config.dhis2.password).toString('base64');
var url  = config.dhis2.url;


ajax.getReq(url+"/api/constants.json?fields=*",auth,function(error,response,body){
    if (error){
        __logger.error("Failed to fetch constants list");
        return;
    }
    constants = JSON.parse(body).constants;
});

function importer(){
    
    
    this.at2dhis2event = function(body,callback){
        
        var result = converter.getEventFromMessage(body.message);
        
        debugger
    }
}
