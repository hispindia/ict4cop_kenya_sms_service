

module.exports = new parser();

const levels = require('./levels.json');

const levelsCodeMap = levels.reduce(function(obj,map){
    map[obj.code] = obj;
    return map;
},[]);

function parser(){

    this.extract = function(omsg){

        debugger
    }
}
