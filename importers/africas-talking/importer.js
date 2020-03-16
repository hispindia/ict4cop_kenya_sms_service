module.exports = new importer();

var api = require('../../api')
var converter = require('./converter');
var constants = require('./constants');

var config = require('../../config.json');
var dhis2api = new api(config)
var smsHelper= require('../../smsHelper');
var offlineResponder = require('./offlineResponder');

function importer(){

    this.isOfflineMessage = function(SMS,callback){

        dhis2api.getObj("userGroups?fields=id,name,users[id,phoneNumber,name,organisationUnits[id,name,path]]&paging=false",function(error,response,body){
            if (error){
                __logger.error("cannot fetch control room user group "+error.toString());
                return
            }

            var userGroups = JSON.parse(body).userGroups;

            var userGroupMap = userGroups.reduce(function(map,obj){
                map[obj.id] = obj;
                return map;
            },[]);
            
            var controlRoomUserG = userGroupMap[constants.metadata.usergroup_control_room];

            debugger
            var flag = controlRoomUserG.users.reduce(function(flag,obj){
                
                if (obj.phoneNumber.includes(SMS.from)){
                    flag=true;
                }
                
                return flag;
            },false);

            if (flag){
                // send response
                offlineRespond(SMS,userGroupMap,callback)
                
            }else{
                callback(false)
            }
        })
    }

    function offlineRespond(SMS,userGroupMap,callback){

        // check for code
        var code = SMS.message.trim().substr(-8);
        var isnum = /^\d+$/.test(code);

        if (!isnum){
            __logger.info("Message from Control Group but no offline code specified!, Passing to importer");
            callback(false)
            return
        }

        dhis2api.getObj("events?program="+constants.metadata.p_smsInbox+"&filter="+constants.metadata.de_sms_offline_response_id+":eq:"+code,function(error,response,body){
            if (error){
                __logger.error("[Offline Responder] Unable to fetch event from code."+error);
                return
            }

            var events = JSON.parse(body).events;
            if (events.length ==0){
                __logger.info("No SMS with the specified code found. Aborting Response"+code);
                return;
            }

            var event = events[0];
            new offlineResponder(event,userGroupMap,function(){});
            
            debugger            
        })
        
    }
    
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

        function postEventCreation(event,messageType,description,orgUnit){

            __logger.info("Creating Event");
            dhis2api.save("events?",event,function(error,response,body){

                if (error){
                    __logger.error("Error while saving event");
                    callback(error);
                    return;
                }

                __logger.info("Message Imported as Event with id["+SMS.id+"], Event:"+JSON.stringify(body));
                callback(null,messageType,description);

                smsHelper.autoForwardToControlGroup(event,
                                                    SMS,
                                                    description,
                                                    messageType,
                                                    orgUnit,
                                                    function(){ })
                
            })
        }        
    }

}
