module.exports = offline_responder;

var moment = require('moment-timezone');
var constants = require('./constants');

var api = require('../../api')
var config = require('../../config.json');
var dhis2api = new api(config)

function offline_responder(event,userGroupMap,callback){

    var eventDVMap = event.dataValues.reduce(function(map,obj){
        map[obj.dataElement] = obj.value;
        return map;
    },[]);

    var users = [];
    var defaultUserGroup = userGroupMap[constants.metadata.usergroup_permanent_responders];

    users = defaultUserGroup.users;
    
    
    const identifiedLevel = eventDVMap[constants.metadata.identifiedLevel];

    if (identifiedLevel){
        
    }
    
    debugger

    
    // check if level group exists

    //  check if ou passes

   debugger
}
