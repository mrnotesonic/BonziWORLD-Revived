const log = require("./log.js").log;
const Ban = require("./ban.js");
const Utils = require("./utils.js");
const io = require('./index.js').io;
const settings = require("./settings.json");
const sanitize = require('sanitize-html');

let roomsPublic = [];
let rooms = {};
let usersAll = [];

exports.beat = function() {
    io.on('connection', function(socket) {
        // users.push(new User(socket));
        new User(socket);
    });
};

function checkRoomEmpty(room) {
    if (room.users.length != 0) return;

    log.info.log('debug', 'removeRoom', {
        room: room
    });

    let publicIndex = roomsPublic.indexOf(room.rid);
    if (publicIndex != -1)
        roomsPublic.splice(publicIndex, 1);
    
    room.deconstruct();
    delete room;
}

class Room {
    constructor(rid, prefs) {
        this.rid = rid;
        this.prefs = prefs;
        this.users = [];
    }

    deconstruct() {
        delete this.rid;
        delete this.prefs;
        delete this.users;
    }

    isFull() {
        return this.users.length >= this.prefs.room_max;
    }

    join(user) {
        user.socket.join(this.rid);
        this.users.push(user);

        this.updateUser(user);
    }

    leave(user) {
       this.emit('leave', {
            guid: user.guid
       });

       let userIndex = this.users.indexOf(user);

       if (userIndex == -1) return;
       this.users.splice(userIndex, 1);

       checkRoomEmpty(this);
    }

    updateUser(user) {
		this.emit('update', {
			guid: user.guid,
			userPublic: user.public
        });
    }

    getUsersPublic() {
        let usersPublic = {};
        this.users.forEach((user) => {
            usersPublic[user.guid] = user.public;
        });
        return usersPublic;
    }

    emit(cmd, data) {
		io.to(this.rid).emit(cmd, data);
    }
}

function newRoom(rid, prefs) {
    rooms[rid] = new Room(rid, prefs);
    log.info.log('debug', 'newRoom', {
        rid: rid
    });
}

let userCommands = {
    "godmode": function(word) {
        let success = word == this.room.prefs.godword;
        if (success) this.private.runlevel = 3;
        log.info.log('debug', 'godmode', {
            guid: this.guid,
            success: success
        });
    },
    "sanitize": function() {
        let sanitizeTerms = ["false", "off", "disable", "disabled", "f", "no", "n"];
        let argsString = Utils.argsString(arguments);
        this.private.sanitize = !sanitizeTerms.includes(argsString.toLowerCase());
    },
    "joke": function() {
        this.room.emit("joke", {
            guid: this.guid,
            rng: Math.random()
        });
    },
    "fact": function() {
        this.room.emit("fact", {
            guid: this.guid,
            rng: Math.random()
        });
    },
    "wtf":function(text){
        var wtf = 
        ['i cut a hole in my computer so i can fuck it',
        'i hate minorities',
        'i said /godmode password and it didnt work',
        'i like to imagine i have sex with my little pony characters',
        'ok yall are grounded grounded grounded grounded grounded grounded grounded grounded grounded for 64390863098630985 years go to ur room',
        'i like to eat dog crap off the ground',
        'i can use inspect element to change your name so i can bully you',
        'i can ban you, my dad is seamus',
        'i got raped by a man, happy pride month!',
        'why do woman reject me, i know i masturbate in public and dont shower but still',
        'put your dick in my nose and lets have nasal sex',
        'my cock is 6 ft so ladies please suck it',
		"i said \'HOST\' giving perms to seamus for his assets is fake news and then i got hate",
		"please make pope free",
		"whats that color",
		"i hosted uranohoshi.in and i pirate shit",
		"i listen to baby from justin bieber",
		"i watch numberblocks",
		"i watch doodland and now people are calling me a doodfag",
		"i watch bfdi and now people are calling me a objectfag",
		"i post klasky csupo effects and now people are calling me a logofag",
		"i am onute saulute and i copied bonziworld revived",
		"i listen to kpop and now i got hate",
		"i inflate people, and body inflation is my fetish.",
		"i installed BonziBUDDY on my pc and now i have a virus",
		"Hey guys, it's me Adela. I know i am an egirl and i made coronavirus on my backyard and i like piracy and i shit on copyright because i'm chinese but why do people hate me?!",
		"i deleted system32",
		"i flood servers, and that makes me cool.",
		"i still use the wii u&trade;",
		"i used homebrew on my nintendo switch and i got banned",
		"i bricked my wii",
		"muda muda muda muda!",
		"i am going to post inflation videos because, remember: \"I inflate people and inflation is my fetish.\"",
		"i copy other people's usernames",
		"i use collaborative virtual machine to install malware",
		"i use microsoft agent scripting helper for fighting videos against innocent people that did nothing wrong by just friendly commenting",
		"i use microsoft agent scripting helper for gofag videos",
		"i use hotswap for my xbox 360",
		"i boycotted left 4 dead 2",
		"CAN U PLZ UNBAN ME PLZ PLZ PLZ PLZ PLZ PLZ PLZ PLZ",
		"I made The Rebellion of SeamusMario55&trade;",
		"I like Unbojih",
		"ItzCrazyScout, No! More like.... ekfheiophjeodxenwobifuodhndoxnwsiohbdeiowdhn2werifhwefief! He banned euhdeioqwdheiwohjixzojqsioh r23oipwshnwq! End of rant.",
		"i play left 4 dead games 24/7",
		"i am so cool. i shit on people, add reactions  that make fun of users on discord, and abuse my admin powers. i am really so cool.",
		"This product will not operate when connected to a device which makes unauthorized copies. Please refer to your instruction booklet for more information.",
		"hey medic i like doodland",
		"i installed windows xp on my real computer",
		"i am whistler and i like to say no u all the time",
		"i like to give my viewers anxiety",
		"how to make a bonziworld server?",
		"shock, blood loss, infection; oh ho ho ho ho, i love stabbing. i feel tres bon!",
		"prego.",
		"oh you're approaching me!",
		"MUTED! HEY EVERYONE LOOK AT ME I SAY MUTED IN ALL CAPS WHEN I MUTE SOMEONE LMAO",
		"i like loliest huhytre",
		"can you boost my server? no? you're mean! >:(",
		"no u",
		"OH OH OH OH OH OH! JOESPH JUDGE! HOW DARE YOU SHUT DOWN BONZIWORLD?! THATS It! YOU'RE GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED GROUNDED FOR 239805479837389274328943729832749382743298 YEARS!",
		"numberblocks is my fetish",
		"i post random gummibar videos on bonziworld",
		"i support meatballmars",
		"PLEASE GIVE THIS VIDEO LIKES!!!!! I CANNOT TAKE IT ANYMORE!",
        "I WILL MAKE A BAD VIDEO OUT OF YOU! GRRRRRRRRRRRR!",
        "Muted",
        "FUCK YOU ITZCRAZYKIKO!!!!!!111!!1 What the fuck is a kiko?",
        "You were the one who started the drama most of the time- WORK AT FURFAG CO YOU FUCKING GREEN MAN DICKRIDER.",
		"i keep watching doodland like forever now",
		"i mined diamonds with a wooden pickaxe",
        "i kept asking for admin and now i got muted",
        'I FAP TO FEMMEPYRO NO JOKE',
        'i am not kid',
        "ACHOO! What was that? Uh-oh looks like you just got coronavirus! Don't you know that the coronavirus is CUMMING to America? The world HOE Organisation is calling HOE-VID19 a POSSIBLE PANTIE-DEMIC! No more touching daddy until you wash your nasty little fingers for secounds with sHOEp and water otherwise it doesn't count! Time to stop spreading your germs and start spreading: your legs! SISSIE ALERT!",
        'i am a gamer girl yes not man no im not man i am gamer girl so give me money and ill giv you my adress <3']
        this.room.emit('talk',{
            text:wtf[Math.floor(Math.random()*wtf.length)],
            guid:this.guid
        })
    },
    "knowledge":function(text){
        var wtf = ['Losky will be forgotten Soon.',
        "We don't like children invading our communities.",
        "Kiddies are type of users who use Grounded threats, say \"Muted\" after muting someone, raging in all caps, use the word \"Kiko\" but we don't know what it means, and post cringy videos. We ban them for a good reason. They also break rules because, as they say, it \"ruins\" the bonziworld site itself."]
        this.room.emit('talk',{
            text:wtf[Math.floor(Math.random()*wtf.length)],
            guid:this.guid
        })
    },
    "youtube": function(vidRaw) {
        if(vidRaw.includes("\"")){
            this.room.emit("talk", {
                guid: this.guid,
                text: "HEY EVERYONE LOOK AT ME I'M TRYING TO SCREW WITH YOUTUBE VIDEOS LMAO"
            }); 
            return;
        }
        if(vidRaw.includes("'")){ 
            this.room.emit("talk", {
                guid: this.guid,
                text: "HEY EVERYONE LOOK AT ME I'M TRYING TO SCREW WITH YOUTUBE VIDEOS LMAO"
            }); 
            return;
        }
        var vid = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        this.room.emit("youtube", {
            guid: this.guid,
            vid: vid
        });
    },
    "backflip": function(swag) {
        this.room.emit("backflip", {
            guid: this.guid,
            swag: swag == "swag"
        });
    },
    "linux": "passthrough",
    "pawn": "passthrough",
    "bees": "passthrough",
    "color": function(color) {
            if (settings.bonziColors.indexOf(color) == -1)
                return;
            
            this.public.color = color;

        this.room.updateUser(this);
    },
    "pope": function() {
        this.public.color = "pope";
        this.room.updateUser(this);
    },
    "asshole": function() {
        this.room.emit("asshole", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
    "triggered": "passthrough",
    "vaporwave": function() {
        this.socket.emit("vaporwave");
        this.room.emit("youtube", {
            guid: this.guid,
            vid: "cU8HrO7XuiE"
        });
    },
    "unvaporwave": function() {
        this.socket.emit("unvaporwave");
    },
    "name": function() {
        let argsString = Utils.argsString(arguments);
        if (argsString.length > this.room.prefs.name_limit)
            return;

        let name = argsString || this.room.prefs.defaultName;
        this.public.name = this.private.sanitize ? sanitize(name) : name;
        this.room.updateUser(this);
    },
    "pitch": function(pitch) {
        pitch = parseInt(pitch);

        if (isNaN(pitch)) return;

        this.public.pitch = Math.max(
            Math.min(
                parseInt(pitch),
                this.room.prefs.pitch.max
            ),
            this.room.prefs.pitch.min
        );

        this.room.updateUser(this);
    },
    "speed": function(speed) {
        speed = parseInt(speed);

        if (isNaN(speed)) return;

        this.public.speed = Math.max(
            Math.min(
                parseInt(speed),
                this.room.prefs.speed.max
            ),
            this.room.prefs.speed.min
        );
        
        this.room.updateUser(this);
    }
};


class User {
    constructor(socket) {
        this.guid = Utils.guidGen();
        this.socket = socket;

        // Handle ban
	    if (Ban.isBanned(this.getIp())) {
            Ban.handleBan(this.socket);
        }

        this.private = {
            login: false,
            sanitize: true,
            runlevel: 0
        };

        this.public = {
            color: settings.bonziColors[Math.floor(
                Math.random() * settings.bonziColors.length
            )]
        };

        log.access.log('info', 'connect', {
            guid: this.guid,
            ip: this.getIp()
        });

        socket.on('login', this.login.bind(this));
    }

    getIp() {
        return this.socket.request.connection.remoteAddress;
    }

    getPort() {
        return this.socket.handshake.address.port;
    }

    login(data) {
        let rid = data.room;
        
		// Check if room was explicitly specified
		var roomSpecified = true;

		// If not, set room to public
		if ((typeof rid == "undefined") || (rid === "")) {
			rid = roomsPublic[Math.max(roomsPublic.length - 1, 0)];
			roomSpecified = false;
		}
		log.info.log('debug', 'roomSpecified', {
			guid: this.guid,
			roomSpecified: roomSpecified
        });
        
		// If private room
		if (roomSpecified) {
            if (sanitize(rid) != rid) {
                this.socket.emit("loginFail", {
                    reason: "nameMal"
                });
                return;
            }

			// If room does not yet exist
			if (typeof rooms[rid] == "undefined") {
				// Clone default settings
				var tmpPrefs = JSON.parse(JSON.stringify(settings.prefs.private));
				// Set owner
				tmpPrefs.owner = this.guid;
                newRoom(rid, tmpPrefs);
			}
			// If room is full, fail login
			else if (rooms[rid].isFull()) {
				log.info.log('warn', 'loginFail', {
					guid: guid,
					reason: "full"
				});
				return socket.emit("loginFail", {
					reason: "full"
				});
			}
		// If public room
		} else {
			// If room does not exist or is full, create new room
			if ((typeof rooms[rid] == "undefined") || rooms[rid].isFull()) {
				rid = Utils.guidGen();
				roomsPublic.push(rid);
				// Create room
				newRoom(rid, settings.prefs.public);
			}
        }
        
        this.room = rooms[rid];

        // Check name
		this.public.name = sanitize(data.name) || this.room.prefs.defaultName;
        
		log.info.log('info', 'login', {
		    guid: this.guid,
		    name: data.name,
		    room: rid

		});
        
		if (this.public.name.length > this.room.prefs.name_limit)
			return socket.emit("loginFail", {
				reason: "nameLength"
			});
        
		if (this.room.prefs.speed.default == "random")
			this.public.speed = Utils.randomRangeInt(
				this.room.prefs.speed.min,
				this.room.prefs.speed.max
			);
		else this.public.speed = this.room.prefs.speed.default;

		if (this.room.prefs.pitch.default == "random")
			this.public.pitch = Utils.randomRangeInt(
				this.room.prefs.pitch.min,
				this.room.prefs.pitch.max
			);
		else this.public.pitch = this.room.prefs.pitch.default;

        // Join room
        this.room.join(this);

        this.private.login = true;

		// Send all user info
		this.socket.emit('updateAll', {
			usersPublic: this.room.getUsersPublic()
		});

		// Send room info
		this.socket.emit('room', {
			room: rid,
			isOwner: this.room.prefs.owner == this.guid,
			isPublic: roomsPublic.indexOf(rid) != -1
		});

        this.socket.on('talk', this.talk.bind(this));
        this.socket.on('command', this.command.bind(this));
        this.socket.on('disconnect', this.disconnect.bind(this));
        if (this.getIp() == "::ffff:127.0.0.1") {
            this.public.color = "pope";
            this.private.runlevel = 3;
            this.room.updateUser(this);
        }
        if (this.getIp() == "::1") {
            this.public.color = "pope";
            this.private.runlevel = 3;
            this.room.updateUser(this);
        }
    }

    talk(data) {
        log.info.log('info', 'talk', {
            guid: this.guid,
            ip: this.getIp(),
            name: data.name,
            text: data.text
        });

        if (typeof data.text == "undefined")
            return;

        let text = this.private.sanitize ? sanitize(data.text) : data.text;
        if ((text.length <= this.room.prefs.char_limit) && (text.length > 0)) {
            this.room.emit('talk', {
                guid: this.guid,
                text: text
            });
        }
    }

    command(data) {
        var list = data.list;
        var command = list[0].toLowerCase();
        var args = list.slice(1);

        log.info.log('debug', command, {
            guid: this.guid,
            args: args
        });

        try {
            if (this.private.runlevel >= (this.room.prefs.runlevel[command] || 0)) {
                let commandFunc = userCommands[command];
                if (commandFunc == "passthrough")
                    this.room.emit(command, {
                        "guid": this.guid
                    });
                else commandFunc.apply(this, args);
            } else
                socket.emit('commandFail', {
                    reason: "runlevel"
                });
        } catch(e) {
            log.info.log('debug', 'commandFail', {
                guid: this.guid,
                command: command,
                args: args,
                reason: "unknown",
                exception: e
            });
            this.socket.emit('commandFail', {
                reason: "unknown"
            });
        }
    }

    disconnect() {

		let ip = "N/A";
		let port = "N/A";

		try {
			ip = this.getIp();
			port = this.getPort();
		} catch(e) { 
			log.info.log('warn', "exception", {
				guid: guid,
				exception: e
			});
		}

		log.access.log('info', 'disconnect', {
			guid: this.guid,
			ip: ip,
			port: port
		});
        
        this.room.leave(this);
        
		try {
			// Delete user
			delete usersPrivate[guid];
			socket.broadcast.emit('leave', {
				guid: guid
			});

			// Remove user from public list
			delete rooms[room].usersPublic[guid];
			// If room is empty
			if (Object.keys(rooms[room].usersPublic).length === 0) {
				log.info.log('debug', 'removeRoom', {
					room: room
				});
				// Delete room
				delete rooms[room];

				var publicIndex = roomsPublic.indexOf(room);
				if (publicIndex != -1) {
					roomsPublic.splice(publicIndex, 1);
				}

			}
		} catch(e) { 
			log.info.log('warn', "exception", {
				guid: this.guid,
				exception: e
			});
		}
    }
}