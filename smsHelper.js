module.exports = new smsHelper();

var config = require('./config.json');

var api = require('./api')
var config = require('./config.json');
var dhis2api = new api(config);
var constants = require('./importers/africas-talking/constants.js');
var smsService = require('./smsService.js');

function smsHelper(){

    this.offlineForward = function(users,
                                   msg,
                                   callback){
        
        sendSMS(users,msg,callback);
    }

    this.autoForwardToControlGroup=function(event,
                                            sms,
                                            description,
                                            messageType,
                                            orgUnit,
                                            callback){

        if (messageType == "spam" ){
            __logger.info("[Auto Forward] spam -> Skipping");
            return
        }

        if (level == "Level 0"){
            __logger.info("[Auto Forward] 'Level 0' -> Skipping")
            return 
        }

        __logger.info("[Auto Forward] Initialise...")

        var smsOfflineID = '';
        var level = event.dataValues.reduce(function(str,obj){
            if (obj.dataElement == constants.metadata.de_identifiedLevel){
                str= obj.value;
            }
            return str;
        },null);

        if (!level){
            level = "[Unknown Level]";
            description = "";
        }
        
        var smsOfflineID = event.dataValues.reduce(function(str,obj){
            if (obj.dataElement == constants.metadata.de_sms_offline_response_id){
                str= obj.value;
            }
            return str;
        },'');
        
        if (orgUnit){
            dhis2api.getObj("organisationUnits/"+orgUnit+"?fields=id,name,ancestors[id,name,level]",function(error,response,body){
                if (error){
                    __logger.error("[Auto Forward] Unable to fetch orgUnit" + orgUnit);
                    return;
                }

                orgUnit = JSON.parse(body);
                orgUnit = orgUnit.ancestors.reduce(function(str,obj){
                    if (obj.level >1){
                        str = obj.name + "/" + str;
                    }
                    
                    return str;
                },orgUnit.name);
                
                makeSMS();
            });
        }else{
            makeSMS();
        }
        
        function makeSMS(){
            var msg = `"${level} ${description}" reported by ${sms.from} from facility="${orgUnit?orgUnit:'Unknown Area'}"\n\n${sms.message}\n\n${smsOfflineID}`;
                        
            _sendToControlGroup(msg,function(){
                
            })
        }
        
    }

    this.sendToControlGroup = function(sms,callback){
        _sendToControlGroup(sms,callback);
    }

    
    function sendSMS(users,sms,callback){

        var phones = [];
        for (key in users){
            if (users[key].phoneNumber){
                phones.push(users[key].phoneNumber)
            }
        }
        phones = phones.join(",");
        smsService.sendSMS(phones,sms,callback)
    }
    
    function _sendToControlGroup(sms,callback){

        dhis2api.getObj("userGroups/"+constants.metadata.usergroup_control_room+"?fields=id,name,users[id,name,phoneNumber]",function(error,response,body){
            
            if (error){
                __logger.error("[Auto Forward] Unable to fetch user groups for control group.");
                return
            }
            var users = JSON.parse(body).users;
            var phones = [];

            for (key in users){
                if (users[key].phoneNumber){
                    phones.push(users[key].phoneNumber)
                }
            }
            phones = phones.join(",");

            smsService.sendSMS(phones,sms,function(error,response,_body){
                if (error){
                    __logger.error("[Auto Forward] Problem sending message to control Group"+error);
                    return;
                }
                __logger.info("[Auto Forward] Message Sent to Control Group");
                __logger.debug(JSON.stringify(_body))
                
            })
        })
    }
}

