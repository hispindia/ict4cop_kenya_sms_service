module.exports = new converter();

var moment = require('moment');
var constants = require('./constants');

var api = require('../../api')
var config = require('../../config.json');
var dhis2api = new api(config)

function converter(){

    function getOrgUnitByPhone(phone,callback){
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

    
    this.getEventFromMessage = function(SMS,option,callback){

        getOrgUnitByPhone(SMS.from,function(orgUnit){
            __logger.debug("OrgunitByPhone "+ orgUnit);
            
            var event = {
                program : constants.metadata.p_smsInbox,
                orgUnit : orgUnit ? orgUnit : constants.metadata.root_ou,
                eventDate: moment().format("YYYY-MM-DD"),
                storedBy: "sms-integration",
                dataValues : []
            };
            var description = null;
            
            event.dataValues.push({
                dataElement : constants.metadata.de_origMsg,
                value : SMS.message
            });

            event.dataValues.push({
                dataElement : constants.metadata.de_timestamp,
                value : SMS.timestamp
            });
            
            event.dataValues.push({
                dataElement : constants.metadata.de_phoneNumber,
                value : SMS.from
            });
            
            event.dataValues.push({
                dataElement : constants.metadata.de_sms_id,
                value : SMS.id+"_"+SMS.linkId+"_"+SMS.networkCode
            });
            
            var deVal_messageType = "spam";
            
            if (option){                
                deVal_messageType="valid";
            }

            if (!option && orgUnit){
                deVal_messageType="invalid";            
            }

            __logger.debug(deVal_messageType+JSON.stringify(option))
            event.dataValues.push({
                dataElement : constants.metadata.de_messageType,
                value : deVal_messageType
            });

            if (option){
                event.dataValues.push({
                    dataElement : constants.metadata.de_identifiedLevel,
                    value : option.code
                });
                
                description = option.name.split("(")[1];
                event.dataValues.push({
                    dataElement : constants.metadata.de_identifiedLevelDescription,
                    value : description
                });
            }
            __logger.debug("Event [ "+JSON.stringify(event));
            
            callback(event,deVal_messageType,description);           
        })
        
    }
    
}
