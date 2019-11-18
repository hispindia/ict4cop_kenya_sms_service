module.exports = new importer();

function importer(){
    this.at2dhis2event = require('./importers/at2dhis2event');
}
