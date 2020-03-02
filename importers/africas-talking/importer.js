module.exports = new importer();

var api = require('../../api')
var converter = require('./converter');
var constants = require('./constants');

var config = require('../../config.json');
var dhis2api = new api(config)
var smsHelper= require('../../smsHelper');

function importer(){
  
    this.init = function(SMS,callback){
        
        // fetch options
        
        dhis2api.getObj("optionSets/"+constants.metadata.optionset_indicator_level+"?fields=id,name,options[id,name,code,attributeValues[value,attribute[id,name,code]]]",function(error,response,body){

            if (error){
                __logger.error("Unable to fetch option set for Indicator Levels. Aborting.");
                callback(error)
                return
            }

            if (!constants.isJson(body)){
                __logger.error("NoJSON - Unable to fetch option set for Indicator Levels. Aborting.");
                callback(true);
                return
            }
            
            var options = JSON.parse(body).options;
            __logger.debug("Options Length"+options.length);
            
            optionCodeMap = options.reduce(function(map,obj){
                var key = obj.code.toLowerCase().replace(/\s\s+/g, ' ');
                map[key] = obj;
                return map;
            },[]);

            var smsKey = SMS.message.toLowerCase().replace(/\s\s+/g, ' ');

            var match = "";
            for (var key in optionCodeMap){
                if (smsKey.startsWith(key)){
                    if (key.length > match.length){
                        match = key;
                    }
                }
            }

            converter.getEventFromMessage(SMS,optionCodeMap[match],postEventCreation);
            
        });

        function postEventCreation(event,messageType,description){

            __logger.info("Creating Event");
            dhis2api.save("events?",event,function(error,response,body){

                if (error){
                    __logger.error("Error while saving event");
                    callback(error);
                    return;
                }

                __logger.info("Message Imported as Event with id["+SMS.id+"], Event:"+JSON.stringify(body));
                callback(null,messageType,description);

                if (messageType == "valid"){
                    smsHelper.autoForwardToControlGroup(event,SMS,description,function(){
                        
                    })
                }                
            })
        }        
    }
}
