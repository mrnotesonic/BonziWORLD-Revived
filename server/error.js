// why copy and paste

const Winston = require('winston');
const path = require('path');
const settings = require("./settings.json");
const fs = require('fs-extra');

var error_loggers = {};

exports.init = function() {
    var loggersKeys = Object.keys(settings.log);
    
    for (var i = 0; i < loggersKeys.length; i++) {
        let key = loggersKeys[i];
        let obj = settings.log[key];
        let dir = path.dirname(obj.filename);

        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);

        let transports = [ new (Winston.transports.File)(obj) ];
        
        if (settings.consoleOutput)
            transports.push(new (Winston.transports.Console)())
        
        error_loggers[key] =  Winston.createLogger({
			level: 'error',
            transports: transports
        });  
    }
} 

exports.log = error_loggers;