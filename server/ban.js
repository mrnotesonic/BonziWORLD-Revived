const log = require('./log.js').log;
const fs = require('fs-extra');
const settings = require("./settings.json");
const io = require('./index.js').io;


let bans;
let mutes;
let logins;
let reports;

exports.init = function() {
    fs.writeFile("./bans.json", "{}", { flag: 'wx' }, function(err) {
        if (!err) console.log("Created empty bans list.");
        try {
            bans = require("./bans.json");
        } catch(e) {
            throw "Could not load bans.json. Check syntax and permissions.";
        }
    });
    fs.writeFile("./mutes.json", "{}", { flag: 'wx' }, function(err) {
        if (!err) console.log("Created empty mutes list.");
        try {
            mutes = require("./mutes.json");
        } catch(e) {
            throw "Could not load mutes.json. Check syntax and permissions.";
        }
    });
    fs.writeFile("./logins.json", "{}", { flag: 'wx' }, function(err) {
        if (!err) console.log("Created empty logins list.");
        logins = require("./logins.json");
    });
    fs.writeFile("./reports.json", "{}", { flag: 'wx' }, function(err) {
        if (!err) console.log("Created empty reports list.");
        reports = require("./reports.json");
    });
};

exports.saveBans = function() {
	fs.writeFile(
		"./bans.json",
		JSON.stringify(bans),
		{ flag: 'w' },
		function(error) {
			log.info.log('info', 'banSave', {
				error: error
			});
		}
	);
};

exports.saveLogins = function() {
	fs.writeFile(
		"./logins.json",
		JSON.stringify(logins)
	);
};
exports.saveReport = function() {
	fs.writeFile(
		"./reports.json",
		JSON.stringify(reports)
	);
};

exports.saveMutes = function() {
	fs.writeFile(
		"./mutes.json",
		JSON.stringify(mutes),
		{ flag: 'w' },
		function(error) {
			log.info.log('info', 'banSave', {
				error: error
			});
		}
	);
}; 

// Ban length is in minutes
exports.addBan = function(ip, length, reason) {
	length = parseFloat(length) || settings.banLength;
	reason = reason || "N/A";
	bans[ip] = {
		reason: reason,
		end: new Date().getTime() + (length * 2630000)
	};

	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);

	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.request.connection.remoteAddress == ip)
			exports.handleBan(socket);
	}
	exports.saveBans();
};

exports.removeBan = function(ip) {
	delete bans[ip];
	exports.saveBans();
};
exports.removeMute = function(ip) {
	delete mutes[ip];
	exports.saveMutes();
};
exports.removeLogin = function(ip) {
	delete logins[ip];
	exports.saveLogins();
};

exports.handleBan = function(socket) {
	var ip = socket.request.connection.remoteAddress;
	if (bans[ip].end <= new Date().getTime()) {
		exports.removeBan(ip);
		return false;
	}

	log.access.log('info', 'ban', {
		ip: ip
	});
		socket.emit('ban', {
			reason: bans[ip].reason,
			end: bans[ip].end
		});
	socket.disconnect();
	return true;
};
exports.handleReport = function(name) {
	var ip = name;
	// Make your own handled function
	return true;
};
exports.handleMute = function(socket) {
	var ip = socket.request.connection.remoteAddress;
	if (mutes[ip].end <= new Date().getTime()) {
		exports.removeMute(ip);
		return false;
	}

	log.access.log('info', 'ban', {
		ip: ip
	});
		socket.emit('mute', {
			reason: mutes[ip].reason  + " <button onclick='hidemute()'>Close</button>",
			end: mutes[ip].end
		});
	return true;
};
exports.handleLogin = function(socket) {
	var ip = socket.request.connection.remoteAddress;

	log.access.log('info', 'loginadded', {
		ip: ip
	});
	return true;
};

exports.kick = function(ip, reason) {
	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);
	reason = reason || "N/A";
	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.request.connection.remoteAddress == ip) {
			socket.emit('kick', {
				reason: reason
			});
			socket.disconnect();
		}
	}
};
exports.warning = function(ip, reason) {
	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);
	reason = reason || "N/A";
	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.request.connection.remoteAddress == ip) {
			socket.emit('warning', {
				reason: reason + " <button onclick='hidewarning()'>Close</button>"
			});
		}
	}
};
exports.mute = function(ip, length, reason) {
	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);
	length = parseFloat(length) || settings.banLength;
	mutes[ip] = {
		reason: reason,
		end: new Date().getTime() + (length * 600)
	};
	reason = reason || "N/A";
	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.request.connection.remoteAddress == ip) {
			exports.handleMute(socket);
		}
	}
	
	exports.saveMutes();
};

const Discord = require('discord.js')
const client = new Discord.Client()

exports.addReport = function(name, username, reason, reporter) {
	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);
	reports[name] = {
		username: username,
		reporter: reporter,
		reason: reason
	};
	reason = reason || "N/A";
	username = username || "missingno";
	reporter = reporter || "FAK SAN WAT ARE YOU DOING, NO!"
	exports.handleReport(name);
	exports.saveReport();
};
exports.login = function(ip, reason) {
	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);
	logins[ip] = {
		reason: reason 
	};
	reason = reason || "N/A";
	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.request.connection.remoteAddress == ip) {
			socket.emit('achieve', {
				reason: reason
			});
			exports.handleLogin(socket);
		}
	}
	exports.saveLogins();
};

exports.isBanned = function(ip) {
    return Object.keys(bans).indexOf(ip) != -1;
};

exports.isIn = function(ip) {
    return Object.keys(logins).indexOf(ip) != -1;
};

exports.isMuted = function(ip) {
    return Object.keys(mutes).indexOf(ip) != -1;
};