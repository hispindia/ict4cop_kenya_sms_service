var moment = require("moment");
var express = require('express');
var config = require('./config.json');
var importer = require('./importers/africas-talking/importer');
var smsService = require('./smsService.js');
var aggregatedReport = require('./aggregateReport.js')
var config = require('./config.json');

var CronJob = require('cron').CronJob;

// Initialise
var app = express();
/**
 * Set up CORS Settings
 */ app.use(function (req, res, next) {

     // Website you wish to allow to connect
     res.setHeader('Access-Control-Allow-Origin', '*');

     // Request methods you wish to allow
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

     // Request headers you wish to allow
     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,apiKey');

     // Pass to next layer of middleware
     next();
 });/**
     */
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


/** Set Up Logging
    var winston = require('winston');
    global.__logger = winston.createLogger({
    level : 'silly',
    transports: [
    new (winston.transports.Console)({
    colorize: true,
    timestamp: true
    }),
    new (winston.transports.File)({
    filename: './logs/server.log',
    timestamp: true
    })
    ]
    });
*/
const {transports, createLogger, format } = require('winston');
const winston = require('winston');
let alignColorsAndTime = winston.format.combine(
    winston.format.colorize({
        all:true
    }),
    winston.format.label({
        label:'[LOGGER]'
    }),
    winston.format.timestamp({
        format:"YY-MM-DD HH:mm:ss"
    }),
    winston.format.prettyPrint(),

    winston.format.printf(
        info => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    )
);

global.__logger = createLogger({
    level:"silly",
    format: winston.format.combine(winston.format.colorize(), alignColorsAndTime),
    
    transports: [
        new transports.Console(),
        new transports.File({filename: 'logs/error.log', level: 'error'}),
        new transports.File({filename: 'logs/activity.log', level:'info'})
    ]
});

/**
 */

var server = app.listen(8010, function () {
    var host = server.address().address
    var port = server.address().port

    __logger.info("Server listening at http://%s:%s", host, port);

    var crontime = '1'
    var job = new CronJob({
        cronTime: '0 */'+crontime+' * * *',
        //       cronTime: '* * * * *',

        onTick: function() {
            __logger.info("Begin scheduled Aggregate Reporting SMS to Control Group");
            new aggregatedReport(crontime);
        },
        start: false,
        runOnInit : false
    });
    
    
})

//Open API for SMS Send
app.post('/sendSMS',function(req,res){
    __logger.info("[SENDSMS]");
    res.writeHead(200, {'Content-Type': 'json'});
    
    if (!req.body.message ||
        !req.headers.apikey ||
        !req.body.to ||
        req.headers.apikey.substring(0,11) != config.sms.apikey.substring(0,11)){
        debugger
        __logger.debug("[SENDSMS] SMS not Valid");

        res.end(JSON.stringify({
            message:"Error",
            error : true
        }));
        return;
    }

    __logger.info("[SENDSMS] Message"+req.body.message + ",phone="+req.body.to)
    smsService.sendSMS(req.body.to,req.body.message,function(error,response){
        if (error){
            __logger.error("[SENDSMS] Problem sending verification message"+response);
            
            res.end(JSON.stringify({
                response:response.message,
                error : error,
                as:"asd"
            }));
            return 
        }else{
            __logger.info("[SENDSMS] Verification Message sent"+response);
            res.end(JSON.stringify({
                response:response,
                error : error,
                as:"asd"
            }));
        }        
    })
});


// Open API 
app.post('/importSMSIntoDHIS2', function(req, res){
    // debugger
    /*
      [ Incoming ] -> {"linkId":"0","text":"Level 0","to":"40153","id":"7f33b0d8-2b0d-4f71-aad7-0d8e0f871519","cost":"None","date":"2019-11-25T09:08:53Z","from":"+254700504425","networkCode":"63902"}

    */

    if (!req.body.text){
        __logger.error("Unknown message not from the SMS Provider.");

        res.writeHead(200, {'Content-Type': 'json'});
        res.end();
        return;
    }

    __logger.info("[ Incoming ] -> "+JSON.stringify(req.body.id));
    __logger.debug("[ Incoming Content ] -> "+JSON.stringify(req.body));

    var body = {
        message : req.body.text,
        from : req.body.from,
        id: req.body.id,
        timestamp : req.body.date,
        to : req.body.to,
        networkCode : req.body.networkCode
    }

    res.writeHead(200, {'Content-Type': 'json'});
    res.end();
    
    importer.isOfflineMessage(body,function(result){
        if (!result){
            importSMS();
        }
    });
    
    function importSMS(){

        importer.init(body,function(error,messageType,description){
     
            if (error){
                __logger.error("[Verification SMS] Import into DHIS2 Failed "+error.toString());
                return
            }
            
            if (messageType == "spam"){
                __logger.info("[Verification SMS] Unknown Number Received. Skipping");
                return;
            }

            var messageContent = `Received "${description}"`;
            if (messageType == "invalid"){
                messageContent = "Received Unknown Code. Please recheck the code.";
            }
            
            smsService.sendSMS(body.from,messageContent,function(error,response,_body){
                if (error){
                    __logger.error("[Verification SMS] Problem sending SMS"+body.id);
                    return;
                }
                __logger.info("[Verification SMS] SMS sent with Id["+body.id+"]");
                
            })
            
        });
    }
})
