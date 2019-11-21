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
        
        // Use the service
        const options = {
            "username" : config.sms.username,
            "to": to,
            "message": message,
            "username" : config.sms.username

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
                to: ['+25407240153'],
                // Set your message
                message: "TestTestTest",
                // Set your shortCode or senderId
            }

            // That’s it, hit send and we’ll take care of the rest
            sms.send(options)
                .then(console.log)
                .catch(console.log);
        }

        sendMessage();
        
    }
}
