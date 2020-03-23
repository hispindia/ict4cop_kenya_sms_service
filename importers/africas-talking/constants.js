

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
    de_sms_offline_response_id : "GajT20fnqa7",
    de_comment : "BJw3aY0mqCK",
    de_recepeints : "isO4XHxr3y3",
    de_sms_sent_status : "rrIwr5wHqUe",
    optionset_indicator_level : "Tl4QLYO23Ur",
    usergroup_control_room : "uGAh1mIvOjV",
    usergroup_permanent_responders : "Xa9xIWspFWA"
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
