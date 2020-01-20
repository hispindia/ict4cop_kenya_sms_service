

exports.metadata = {
    root_ou : "VLajhjl0oDi",
    p_smsInbox : "XdaTA90q9m2",
    p_fieldAgent : "EWnByTf3fec",
    de_fieldAgentPhone : "CcTpGwP197E",
    de_origMsg : "ZdO70WOVnVk",
    de_identifiedLevel : "wuU0oc3VNce",
    de_identifiedLevelDescription : "M9ClPb6oSTO",
    de_phoneNumber : "zwkPeFXDO7L",
    de_timestamp : "FySEVG4xwia",
    de_messageType : "wQCA8pnlZhJ",
    de_sms_id : "BfsRG4RBQpe",
    optionset_indicator_level : "Tl4QLYO23Ur"

}

exports.isJson = function(data){
    if (!data){
        return false;
    }
    
    try{
        var json = JSON.parse(data);
        return true;
    }catch(e){
        return false;
    }
}
