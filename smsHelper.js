module.exports = new smsHelper();

var config = require('./config.json');

var api = require('./api')
var config = require('./config.json');
var dhis2api = new api(config);
var constants = require('./importers/africas-talking/constants.js');
var smsService = require('./smsService.js');

function smsHelper(){

    this.autoForwardToControlGroup=function(event,sms,description,callback){

        debugger
        var level = event.dataValues.reduce(function(str,obj){
            if (obj.dataElement == constants.metadata.de_identifiedLevel){
                str= obj.value;
            }
            return str;
        },'');
        
        var msg = `"${level} ${description}" received from "${sms.from}". SMS="${sms.message}"`;
        __logger.info(msg+" Auto forwarding..");

        _sendToControlGroup(msg,function(){

        })
    }

    this.sendToControlGroup = function(sms,callback){
        _sendToControlGroup(sms,callback);
    }


    function _sendToControlGroup(sms,callback){

          dhis2api.getObj("userGroups/"+constants.metadata.usergroup_control_room+"?fields=id,name,users[id,name,phoneNumber]",function(error,response,body){
            
            if (error){
                __logger.error("Unable to fetch user groups for control group.");
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
                    __logger.error("Problem sending message to control Group"+body.id);
                    return;
                }
                __logger.info("[Control Group] Message Sent");
                
            })
        })
    }
}

