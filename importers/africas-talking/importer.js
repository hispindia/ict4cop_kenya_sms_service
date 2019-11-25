module.exports = new importer();

var api = require('../../api')
var converter = require('./converter');
var constants = require('./constants');

var config = require('../../config.json');
var dhis2api = new api(config)

function importer(){

  
    this.init = function(SMS,callback){
        
        // fetch options
        
        dhis2api.getObj("optionSets/"+constants.metadata.optionset_indicator_level+"?fields=id,name,options[id,name,code,attributeValues[value,attribute[id,name,code]]]",function(error,response,body){

            if (error){
                __logger.error("Unable to fetch option set for Indicator Levels. Aborting.");
                callback(error)
                return
            }

            var options = JSON.parse(body).options;

            optionCodeMap = options.reduce(function(map,obj){
                var key = obj.code.toLowerCase().replace(/\s/g, "");
                map[key] = obj;
                return map;
            },[]);

     //       console.log(SMS);

            if (!SMS.message){
                __logger.error("Message Not Present");
                callback(true);
                return;
            }
            var smsKey = SMS.message.toLowerCase().replace(/\s/g, "");

            var match = "";
            for (var key in optionCodeMap){
                if (smsKey.startsWith(key)){
                    if (key.length > match.length){
                        match = key;
                    }
                }
            }

            if (match == ""){
                // Unknown
            }

            converter.getEventFromMessage(SMS,optionCodeMap[match],postEventCreation);
            
        });

        function postEventCreation(event){

            __logger.info("Creating Event");
            dhis2api.save("events?",event,function(error,response,body){

                if (error){
                    __logger.error("Error while saving event");
                    callback(error);
                    return;
                }

                callback(null,SMS)
                debugger
                
            })
        }
        
        
        
    }

}
