module.exports = offline_responder;

var moment = require('moment-timezone');
var constants = require('./constants');

var api = require('../../api')
var config = require('../../config.json');
var dhis2api = new api(config)

function offline_responder(SMS,callback){
    
    var url = "events.json?program="+constants.metadata.p_fieldAgent+"&filter="+constants.metadata.de_fieldAgentPhone+":eq:"+encodeURIComponent(phone);
    
    __logger.info(url);
    
    dhis2api.getObj(url,function(error,response,body){            
        if (error || !constants.isJson(body)){
            __logger.error("Unable to fetch ou from phone. Aborting."+error+body);
            return
        }

        var _body = JSON.parse(body);

        if (!_body.events){
            __logger.error("Error"+body)
            return
        }
        
        if (_body.events.length == 0){
            __logger.debug("No event found for the phone number"+phone);
            callback(null);
            return
        }
        
        if (_body.events.length > 2){
            __logger.info("More than on facility assigned to a field agent!!!");
        }

        __logger.debug("Following Org Unit found for the phone number"+phone + "->"+_body.events[0].orgUnit);
        callback(_body.events[0].orgUnit);
    });
}
