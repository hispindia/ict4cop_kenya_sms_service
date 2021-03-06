module.exports = aggregateReport;

var constants = require('./importers/africas-talking/constants.js');
var api = require('./api')
var config = require('./config.json');
var dhis2api = new api(config)
var smsHelper = require('./smsHelper.js');

var moment = require('moment-timezone');

function aggregateReport(crontime){

    var date = moment().tz("Africa/Nairobi");
    date.subtract(moment.duration("0"+crontime+":00:00"));
    date = date.toISOString(true).split("+")[0];

    dhis2api.getObj("events?paging=false&program="+constants.metadata.p_smsInbox+"&startDate="+date,function(error,response,body){
       
        if (error){
            __logger.error("Unable to fetch events for aggregate reporting.");
            return
        }

        var events = JSON.parse(body).events;
        var sms = makeSMS(events)
        __logger.info("SMS Report sending to Control group=" + sms+"Timestamp="+date+"Current Date="+moment().toISOString(true));
        
        smsHelper.sendToControlGroup(sms,function(){
        })
    })

    
    function makeSMS(events){

        if (events.length == 0){
            return "[UPDATE] No Messages have come in the last "+crontime + " hour";
        }
        
        var statusMap = events.reduce(function(map,ev){
            
            for (var key in ev.dataValues){
                var dv = ev.dataValues[key];
                if (dv.dataElement == constants.metadata.de_messageType ||
                   dv.dataElement == constants.metadata.de_identifiedLevelDescription){
                    if (!map[dv.value]){
                        map[dv.value] = 0;
                    }
                    map[dv.value] += 1;
                }                
            }
            
            return map;
        },[]);

        var SMS = []
        for (var key in statusMap){
            if (key !="valid" &&
                key!="invalid" &&
                key !="spam"){
                SMS.push( `Received  ${statusMap[key]} messages of "${key}".\n`)
            }
        }

        for (var key in statusMap){
            if (key =="valid" ||
                key=="invalid" ||
                key =="spam"){
                SMS.push( ` [${key}=${statusMap[key]}]`)
            }
        }
        
        return "[UPDATE] "+SMS.join(' ');
    }
}
