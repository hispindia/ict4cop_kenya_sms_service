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
      
        __logger.info("Sending Verification Message");
        
        to = to.split(",");
        
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
            __logger.debug("Message "+message);

            // That’s it, hit send and we’ll take care of the rest
            sms.send(options)
                .then(function(v1){
                    __logger.info("Message Sent"+JSON.stringify(v1));
                    callback(false,v1);
                })
                .catch(function(error){
                    debugger
                    __logger.error("In Catch Send SMS : "+error)
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
