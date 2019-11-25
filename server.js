var moment = require("moment");
var express = require('express');
var config = require('./config.json');
var importer = require('./importers/africas-talking/importer');
var smsService = require('./smsService.js');


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
     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

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
    
})

// Open API 
app.get('/importSMSIntoDHIS2', function(req, res){
   // debugger
  
    __logger.info("[ Incoming ] -> "+JSON.stringify(req.query));

    /*
    var body = {
        message : "Level 3a b asdfuweyfgwuibd",
        sender : "9876545453435",
        timstamp : moment().toISOString()
    }
    */
    
    var body = {
        message : req.query.text,
        sender : req.query.from,
        timstamp : req.query.date
    }
    
    importer.init(body,function(error,response,body){
        
        res.writeHead(200, {'Content-Type': 'json'});
        res.end();

        if (error){

        }

        smsService.sendSMS(response.sender,"Your message was received by the system.",function(){

        })
        
    });
    
    
})

//smsService.sendSMS("+254719277020","Your message was received by the system.",function(){})
