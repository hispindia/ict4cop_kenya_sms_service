module.exports = new converter();
//var parser = require('./parser')

const metadata = {
    p_smsInbox : "XdaTA90q9m2",
    de_origMsg : "ZdO70WOVnVk",
    de_identifiedLevel : "wuU0oc3VNce",
    de_phoneNumber : "zwkPeFXDO7L",
    de_timestamp : "FySEVG4xwia"

}

function converter(){

    this.getEventFromMessage = function(msg){
        debugger

        var event = {
            program : metadata.p_smsInbox
            
        }
    }
    
}
