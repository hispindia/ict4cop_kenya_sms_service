module.exports = new smsService();

var config = require('./config.json');
/*var _api = require('./api');
  var api = new _api({
  base_url : config.sms.base_url,
  auth : config.sms.apikey
  
  });
*/
var request = require('request');

function smsService(){
   
    this.sendSMS = function(to,message,callback){           
        
        __logger.info("[Core SMS] '"+message+"' : "+to);
        
        to = to.split(",");
        to = to.reduce(function(list,obj){
            if (obj.length ==13){
                list.push(obj);
            }else{
                __logger.debug("[Core SMS] There is a phone Number in wrong format! Ignoring."+obj);
            }
            
            return list
        },[]);

        debugger
      //  __logger.debug(">>>>"+to);
        if (to.length == 0){
            callback(true,"No Number")
            return
        }
        
        // Initialize the SDK
        const AfricasTalking = require('africastalking')({
            apiKey: config.sms.apikey,
            username: config.sms.username

        });
        
        // Get the SMS service
        const sms = AfricasTalking.SMS;

        function sendMessage() {
            
            const options = {
                // Set the numbers you want to send to in international format
                to: to,
                // Set your message
                message: message,
                // Set your shortCode or senderId
            }

            // That’s it, hit send and we’ll take care of the rest
            sms.send(options)
                .then(function(v1){
                    __logger.info("[Core SMS] Message Sent"+JSON.stringify(v1));
                    callback(false,v1);
                })
                .catch(function(error){
                    debugger
                    __logger.error("[Core SMS] In Catch Send SMS : "+error)
                    callback(true,error);

                })
        }

        sendMessage();
        
    }
}

/*      request({
        url:  config.sms.base_url,
        method: "POST",
        //    json: true,   // <--Very important!!!
        body: JSON.stringify(options),
        headers: {
        "apiKey": config.sms.apikey,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept" : "application/json"

        }
        }, function (error, response, body) {
        debugger
        //callback(error,response,body);
        });

*/
