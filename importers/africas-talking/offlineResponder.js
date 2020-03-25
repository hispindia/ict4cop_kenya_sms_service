module.exports = offline_responder;
var constants = require('./constants');
var smsHelper= require('../../smsHelper');

var api = require('../../api')
var config = require('../../config.json');
var dhis2api = new api(config);

function offline_responder(SMS,event,eventOU,userGroups,callback){

    var eventDVMap = event.dataValues.reduce(function(map,obj){
        map[obj.dataElement] = obj.value;
        return map;
    },[]);

    var userGroupMap = userGroups.reduce(function(map,obj){
        map[obj.id] = obj;
        return map;
    },[]);

    var userGroupByCodeMap = userGroups.reduce(function(map,obj){
        if (obj.code){
            map[obj.code] = obj;
        }
        return map;
    },[]);

    var users = [];
    var defaultUserGroup = userGroupMap[constants.metadata.usergroup_permanent_responders];
    var controlGroupUserGroup = userGroupMap[constants.metadata.usergroup_control_room];
    var identifiedLevelUserGroup = undefined;
    
    
    if (eventDVMap[constants.metadata.identifiedLevel]){
        identifiedLevelUserGroup = userGroupByCodeMap[eventDVMap[constants.metadata.identifiedLevel].value]
    }
    
    var users = getUsers(event,
                         eventOU.path,
                         defaultUserGroup,
                         identifiedLevelUserGroup,
                         controlGroupUserGroup
                        );

    var msg = SMS.message;
    msg = msg.substring(0,msg.length-8);
    
    smsHelper.offlineForward(users,msg,function(error,response,body){
        if (error){
            __logger.error("[Offline Response] Error sending offline sms"+error);
            return;
        }
        __logger.info("[Offline Response] Message Sent");

        event.status = "COMPLETED";

        var userNames = users.reduce(function(str,obj){
            str = str + "," +obj.name;
            return str;
        },"");
        
        if (eventDVMap[constants.metadata.de_comment]){
            eventDVMap[constants.metadata.de_comment].value = msg
        }else{
            event.dataValues.push({
                dataElement :constants.metadata.de_comment ,
                value :msg
            })
        }

        if (eventDVMap[constants.metadata.de_recepeints]){
            eventDVMap[constants.metadata.de_recepeints].value = userNames
        }else{
            event.dataValues.push({
                dataElement :constants.metadata.de_recepeints ,
                value : userNames
            })
        }

        
        if (eventDVMap[constants.metadata.de_sms_sent_status]){
            eventDVMap[constants.metadata.de_sms_sent_status].value = "SENT Offline"
        }else{
            event.dataValues.push({
                dataElement :constants.metadata.de_sms_sent_status ,
                value : "SENT Offline"
            })
        }

        dhis2api.update("events/"+event.event,event,function(error,response,body){
            
            if (error){
                __logger.error("[Offline Response] Error while updating event"+error);
                return;
            }

            __logger.debug("[Offline Response]  updated event"+JSON.stringify(body));

            debugger
        })
    })
    
  
}

function getUsers(event,eventOUPath,defaultUG,identifiedLevelUG,controlGroupUsers){

    var users = [];

    if (identifiedLevelUG){
        users.push(...identifiedLevelUG.users)
    }

    users = users.filter(function(user){        
        return user.organisationUnits.reduce(function(result,ou){
            if (eventOUPath.includes(ou.id)){
                result = true;
            }
            return result
        },false)    
    });

    if (defaultUG.users){
        users.push(...defaultUG.users)
    }

    if (controlGroupUsers){
        users.push(...controlGroupUsers.users)
    }

    // filter uniq https://stackoverflow.com/a/56757215/4989935
    users = users.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
    
    return users;
}
