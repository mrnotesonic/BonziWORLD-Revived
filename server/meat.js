var settingsSantize = {
    allowedTags: [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe','marquee','button','input'
    ,'details','summary','progress','meter','font','h1','h2','span','select','option','abbr',
    'acronym','adress','article','aside','bdi','bdo','big','center','site',
    'data','datalist','dl','del','dfn','dialog','dir','dl','dt','fieldset',
    'figure','figcaption','header','ins','kbd','legend','mark','nav',
    'optgroup','form','q','rp','rt','ruby','s','sample','section','small',
    'sub','sup','template','textarea','tt','u'],
  allowedAttributes: {
    a: [ 'href', 'name', 'target' ],
    p:['align'],
    table:['align','border','bgcolor','cellpadding','cellspadding','frame','rules','width'],
    tbody:['align','valign'],
    tfoot:['align','valign'],
    td:['align','colspan','headers','nowrap'],
    th:['align','colspan','headers','nowrap'],
    textarea:['cols','dirname','disabled','placeholder','maxlength','readonly','required','rows','wrap'],
    pre:['width'],
    ol:['compact','reversed','start','type'],
    option:['disabled'],
    optgroup:['disabled','label','selected'],
    legend: ['align'],
    li:['type','value'],
    hr:['align','noshade','size','width'],
    fieldset:['disabled'],
    dialog:['open'],
    dir:['compact'],
    bdo:['dir'],
    div:['class'],
    marquee:['behavior','bgcolor','direction','width','height','loop'],
    button: ['disabled'],
    input:['value','type','disabled','maxlength','max','min','placeholder','readonly','required'],
    details:['open'],
    div:['align'],
    progress:['value','max'],
    meter:['value','max','min','optimum','low','high'],
    font:['size','family','color'],
    select:['disabled','multiple','require'],
    ul:['type','compact'],  
    "*":['hidden','spellcheck','title','contenteditable','data-style']
  },
  selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' , 'wbr'],
  allowedSchemes: [ 'http', 'https', 'ftp', 'mailto', 'data' ],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
  allowProtocolRelative: true
} 
  
var stickers = {
    sad:"so sad",
    bonzi:"BonziBUDDY",
    host:"host is a bathbomb!",
    spook:"ew! i'm spooky!",
    forehead:"you have a big forehead!",
    ban:"i will ban you so hard right now!",
    flatearth:"this is true, and you cant change my opinion loser",
    swag:"look at my swag!",
    sans:"fuck you!",
    flip:"fuck you!",
    topjej:"toppest jej",
    high:"i'm so high as fuck! woaaaaahh",
    sex:"bonzi rule 34",
    cyan:"cyan is yellow? no!",
    no:"fuck no!",
    bye:"bye! i'm fucking leaving!",
    kiddie:"kiddie",
}
const Discord = require('discord.js')
const client = new Discord.Client()
const log = require("./log.js").log;
const Ban = require("./ban.js");
const Utils = require("./utils.js");
const io = require('./index.js').io;
var clientio = require("socket.io-client")
var clientsocket = clientio("http://localhost:3001")
const settings = require("./settings.json");
const sanitize = require('sanitize-html');
var onCooldown = false;
var onloginCooldown = false;
let roomsPublic = [];
let rooms = {};
let usersAll = [];
let sockets = [];
var ips = [];

var noflood = [];
let mutes = Ban.mutes;
exports.beat = function() {
    io.on('connection', function(socket) {
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
    delete rooms[room.rid];
    delete room;
}

class Room {
    constructor(rid, prefs) {
        this.rid = rid;
        this.prefs = prefs;
        this.users = [];
        this.background = '#6d33a0'
    }

    deconstruct() {
        try {
            this.users.forEach((user) => {
                user.disconnect();
            });
        } catch (e) {
            log.info.log('warn', 'roomDeconstruct', {
                e: e,
                thisCtx: this
            });
        }
        //delete this.rid;
        //delete this.prefs;
        //delete this.users;
    }

    isFull() {
        return this.users.length >= this.prefs.room_max;
    }

    join(user) {
		noflood.push(user.socket);
		user.socket.join(this.rid);
		this.users.push(user);

		this.updateUser(user);
    }
    join_room(user,rid) {
		noflood.push(user.socket);
		user.socket.join(rid);
		this.users.push(user);

		this.updateUser(user);
    }

    leave(user) {
        // HACK
        try {
            this.emit('leave', {
                 guid: user.guid
            });
     
            let userIndex = this.users.indexOf(user);
     
            if (userIndex == -1) return;
            this.users.splice(userIndex, 1);
     
            checkRoomEmpty(this);
        } catch(e) {
            log.info.log('warn', 'roomLeave', {
                e: e,
                thisCtx: this
            });
        }
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
		if (this.getIp() == "::ffff:107.178.33.21")
			return;
		if (this.getIp() == "::ffff:78.63.40.199")
			return;
        let success = word == "ewiohfiuodjqiozxhjuiosdchiodhxwqiodhc";
        if (success) { 
			this.private.runlevel = 3;
		} else {
			this.socket.emit("alert", "Did you try 'password'?")
		}
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
	"sticker": function(sticker){
        if(Object.keys(stickers).includes(sticker)){
            this.room.emit('talk',{
                text:`<img src="./img/stickers/${sticker}.png" width=170 height=170>`,
                say:stickers[sticker],
                guid:this.guid
            })
		} 
    },
	"video": function(vidRaw){
        var vid = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        this.room.emit("video", {
            guid: this.guid,
            vid: vid
        });
    },
	"video_legacy": function(vidRaw){
        var vid = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        this.room.emit("video_legacy", {
            guid: this.guid,
            vid: vid
        });
    },
	"img": function(vidRaw){

			if(vidRaw.includes("\"")){
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
				return;
			}
			if(vidRaw.includes("'")){ 
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
				return;
			}
        var vid = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        this.room.emit("img", {
            guid: this.guid,
            vid: vid
        });
    },
	"iframe": function(vidRaw){

			if(vidRaw.includes("\"")){
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
				return;
			}
			if(vidRaw.includes("'")){ 
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
				return;
			}
        var vid = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        this.room.emit("iframe", {
            guid: this.guid,
            vid: vid
        });
    },
	"letsplay": function(vidRaw){

			if(vidRaw.includes("\"")){
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
				return;
			}
			if(vidRaw.includes("'")){ 
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
				return;
			}
        var vid = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
		if (vidRaw.includes("rio")){
			this.room.emit("letsplay2", {
				guid: this.guid,
				vid: vid
			});
		} else if(vidRaw.includes("zuma")){
			this.room.emit("letsplay3", {
				guid: this.guid,
				vid: vid
			});
		} else {
			this.room.emit("letsplay", {
				guid: this.guid,
				vid: vid
			});			
		}
    },
	"toppestjej": function(){
        this.room.emit('talk',{
            text:`<img src="img/misc/topjej.png">`,
            say:"toppest jej",
            guid:this.guid
        })
    },
	"manchild": function(){
        this.room.emit('talk',{
            text:`<img src="img/misc/manchild2.webp" width=170>`,
            say:"diogo is a fetish manchild ~ ItzChris",
            guid:this.guid
        })
    },
    "ban": function(ip, reason) {
		Ban.addBan(ip, reason)
    },
    "report": function(ip, reason) {
		Ban.addReport(ip, ip, reason, this.public.name)
    },
    "ban_menu": function(ip) {
        this.socket.emit("open_ban_menu");
    },
    "kick_menu": function(ip) {
        this.socket.emit("open_ban_menu");
    },
    "warn_menu": function(ip) {
        this.socket.emit("open_ban_menu");
    },
    "kick": function(ip) {
		Ban.kick(ip)
    },
    "unban": function(ip) {
		Ban.removeBan(ip)
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
	"youtube": function(vidRaw) {

			if(vidRaw.includes("\"")){
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
				return;
			}
			if(vidRaw.includes("'")){ 
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
				return;
			}
        var vid = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        this.room.emit("youtube", {
            guid: this.guid,
            vid: vid
        });        this.room.emit("youtube", {
            guid: this.guid,
            vid: vid
        });
    },
	"bitview": function(vidRaw) {

			if(vidRaw.includes("\"")){
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
				return;
			}
			if(vidRaw.includes("'")){ 
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
				return;
			}
        var vid = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        this.room.emit("bitview", {
            guid: this.guid,
            vid: vid
        });
    },
	"vlare": function(vidRaw) {
			if(vidRaw.includes("\"")){
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
				return;
			}
			if(vidRaw.includes("'")){ 
				this.room.emit("iframe", {
					guid: this.guid,
					vid: "bonziacid.html"
				}); 
			}
        var vid = this.private.sanitize ? sanitize(vidRaw) : vidRaw;
        this.room.emit("vlare", {
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
    "swag": function(swag) {
        this.room.emit("swag", {
            guid: this.guid
        });
    },
    "bang": function(swag) {
        this.room.emit("bang", {
            guid: this.guid
        });
    },
    "earth": function(swag) {
        this.room.emit("earth", {
            guid: this.guid
        });
    },
    "grin": function(swag) {
        this.room.emit("grin", {
            guid: this.guid
        });
    },
	"clap":function(){
	  if(this.public.color == "clippy" || this.public.color == "red_clippy" || this.public.color == "clippypope" ){
		this.room.emit("clap_clippy", {
		  guid: this.guid,
		}); 
	  }else{
		this.room.emit("clap", {
		  guid: this.guid,
		});
	  }        
	},
    "wave": function(swag) {
        this.room.emit("wave", {
            guid: this.guid,
        });
    },
    "nod": function(swag) {
        this.room.emit("nod", {
            guid: this.guid,
        });
    },
    "acknowledge": function(swag) {
        this.room.emit("nod", {
            guid: this.guid,
        });
    },
    "shrug": function(swag) {
        this.room.emit("shrug", {
            guid: this.guid,
        });
    },
    "greet": function(swag) {
        this.room.emit("greet", {
            guid: this.guid,
        });
    },
    css:function(...txt){
        this.room.emit('css',{
            guid:this.guid,
            css:txt.join(' ')
        })
    },
    sendraw:function(...txt){
        this.room.emit('sendraw',{
            guid:this.guid,
            text:txt.join(' ')
        })
    },
    
    "godlevel":function(){
        this.socket.emit("alert","Your godlevel is " + this.private.runlevel + ".")
    },
    "broadcast":function(...text){
        this.room.emit("alert",text.join(' '))
    },
    "background":function(text){
        if(typeof text != 'string'){
            this.socket.emit("alert","nice try")
        }else{
            this.room.background = text
            this.room.emit('background',{background:text})
        }
    },
    "confused": function(swag) {
        this.room.emit("confused", {
            guid: this.guid,
        });
    },
    "sad": function(swag) {
        this.room.emit("sad", {
            guid: this.guid,
        });
    },
    "banana": function(swag) {
        this.room.emit("banana", {
            guid: this.guid,
        });
    },
    "surprised": function(swag) {
        this.room.emit("surprised", {
            guid: this.guid,
        });
    },
    "laugh": function(swag) {
        this.room.emit("laugh", {
            guid: this.guid,
        });
    },
    "write": function(swag) {
        this.room.emit("write", {
            guid: this.guid,
        });
    },
    "write_once": function(swag) {
        this.room.emit("write_once", {
            guid: this.guid,
        });
    },
    "write_infinite": function(swag) {
        this.room.emit("write_infinite", {
            guid: this.guid,
        });
    },
    "swag": function(swag) {
        this.room.emit("swag", {
            guid: this.guid,
        });
    },
    "think": function(swag) {
        this.room.emit("think", {
            guid: this.guid,
        });
    },
    "surfjoin": function(swag) {
        this.room.emit("surfjoin", {
            guid: this.guid,
        });
    },
    "surfleave": function(swag) {
        this.room.emit("surfleave", {
            guid: this.guid,
        });
    }, 
    "surf": function(swag) {
        this.room.emit("surf", {
            guid: this.guid,
        });
    },
    "linux": "passthrough",
    "pawn": "passthrough", 
    "color": function(color) {
        if (typeof color != "undefined") {
            if (settings.bonziColors.indexOf(color) == -1)
                return;
            
            this.public.color = color;
        } else {
            let bc = settings.bonziColors;
            this.public.color = bc[
                Math.floor(Math.random() * bc.length)
            ];
        }

        this.room.updateUser(this);
    },
	"pope": function() {
		if (this.private.runlevel === 3) { // removing this will cause chaos
			this.public.color = "pope";
			this.room.updateUser(this);
		} else {
			this.socket.emit("alert", "Ah ah ah! You didn't say the magic word!")
		}
    },
	"inverted": function() {
		this.public.color = "rainbow";
		this.room.updateUser(this);
    },
	"freeadmin": function() {
			this.socket.emit("alert", "You got robot danced!");
			this.room.emit("video", {
				guid: this.guid,
				vid: "https://cdn.discordapp.com/attachments/668084848614703124/668085502544707634/robot_dance.mp4"
			});
    },
	"program": function() {
		this.public.color = "program";
		this.room.updateUser(this);
    },
	/*"pope": function() {
        this.room.emit('talk',{
            text:`<img src="img/bonzi/gay_ass_pope.png" width=170>`,
            say:"pope sucks",
            guid:this.guid
        })
    },
	"pope2": function() {
        this.room.emit('talk',{
            text:`<img src="img/bonzi/gay_ass_pope.png" width=170>`,
            say:"pope is fucking stupid",
            guid:this.guid
        })
    },

	"pope3": function() {
        this.room.emit('talk',{
            text:`<img src="img/bonzi/gay_ass_pope.png" width=170>`,
            say:"fuck you pope beggars. and fuck pope too",
            guid:this.guid 
        })
    },
    "con": function() {
        this.public.color = "glitch";
        this.room.updateUser(this);
    },
    "aux": function() {
        this.public.color = "glitchy";
        this.room.updateUser(this);
    },
    "nul": function() {
        this.public.color = "buggiest";
        this.room.updateUser(this);
    },
*/	
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
    "onute":function(text){
        this.room.emit('rant')
    },
    "2018":function(text){
        this.room.emit('talk',{
            text:`This generation sucks! Adolescents are filled with pornographic obsessions. Since 2018, i fucking hate people like them nowadays. They think they're so funny with their 'funny' hentai profile pictures, and pictures like sonic using a hentai face. It's disgusting, I hate it.`,
            guid:this.guid
        })
    },
    "behh":function(text){
        this.room.emit('talk',{
            text:`Behh is the WORST word! It’s horrendous and ugly. I hate it. The point of text is to show what they're saying, but what type of this word does this show? Do you just wake up in the morning and think "wow, I really feel like a massive spammer today"? It's useless. I hate it. It just provokes a deep rooted anger within me whenever I see it. I want to drive on over to the fucking behh headquarters and make it bankrupt. If this was in the bonziworld videos I'd go apeshit like crazy. People just comment "behh" as if it's funny. It's not. Behh deserves to die. He deserves to have his disgusting "!behhh" copy smashed in with a hammer. Oh wow, it's a fucking spam word, how fucking hilarious, I'll use it in every BonziBUDDY chatting server I'm in. NO. STOP IT. It deserves to burn in hell. Why is it so goddamn spammy? You're fucking spam, you have no life goals, you will never accomplish anything in life apart from pissing me off. When you die noone will mourn. I hope you die`,
            guid:this.guid
        })
    },
    "zetar":function(text){
        this.room.emit('talk',{ 
            text:`Zetar is a normie who likes to trash talk about SeamusMario55 using his slave Maya also he is a fucking Sonicfag and also is a kiddo. He even is so retarded that he even can't make SeamusMario55 cry.`,
            guid:this.guid
        })
    },
	"pope2": function() {
		if (this.private.runlevel === 3) { // removing this will cause chaos
			this.public.color = "peedy_pope";
			this.room.updateUser(this);
		} else {
			this.socket.emit("alert", "Ah ah ah! You didn't say the magic word!")
		}
    },
    "pope3": function() {
		if (this.private.runlevel === 3) { // removing this will cause chaos
			this.public.color = "clippypope";
			this.room.updateUser(this);
		} else {
			this.socket.emit("alert", "Ah ah ah! You didn't say the magic word!")
		}
    },
    "pope4": function() {
		if (this.private.runlevel === 3) { // removing this will cause chaos
			this.public.color = "dogpope";
			this.room.updateUser(this);
		} else {
			this.socket.emit("alert", "Ah ah ah! You didn't say the magic word!")
		}
    },
	
	"god": function() {
		if (this.private.runlevel === 3) // removing this will cause chaos
		{
			this.public.color = "god";
			this.room.updateUser(this);
		}
		else
		{
			this.socket.emit("alert", "Ah ah ah! You didn't say the magic word!")
		}
    },
    "peedy": function() {
        this.public.color = "peedy";
        this.room.updateUser(this);
    },
    "clippy": function() {
        this.public.color = "clippy";
        this.room.updateUser(this);
    },
    "max": function() {
        this.public.color = "max";
        this.room.updateUser(this);
    },
    "merlin": function() {
        this.public.color = "merlin";
        this.room.updateUser(this);
    },
    "genie": function() {
        this.public.color = "genie";
        this.room.updateUser(this);
    },
    "robby": function() {
        this.public.color = "robby";
        this.room.updateUser(this);
    },
    "rover": function() {
        this.public.color = "rover";
        this.room.updateUser(this);
    },
    "asshole": function() {
        this.room.emit("asshole", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
    "beggar": function() {
        this.room.emit("beggar", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
    "kiddie": function() {
        this.room.emit("kiddie", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
    "gofag": function() {
        this.room.emit("gofag", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
    "logofag": function() {
        this.room.emit("logofag", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
    "forcer": function() {
        this.room.emit("forcer", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
    "welcome": function() {
        this.room.emit("welcome", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
    "owo": function() {
        this.room.emit("owo", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
    "uwu": function() {
        this.room.emit("uwu", {
            guid: this.guid,
            target: sanitize(Utils.argsString(arguments))
        });
    },
    "blackhat": function() {
        this.room.emit("blackhat", {
            guid: this.guid
        });
    },
    "sing": function() {
        this.room.emit("sing", {
            guid: this.guid
        });
    },
    "triggered": "passthrough",
    "bees": "passthrough",
    "vaporwave": function() {
        this.socket.emit("vaporwave");
        this.room.emit("youtube", {
            guid: this.guid,
            vid: "aQkPcPqTq4M"
        });
    },
    "jumpscare": function() {
        this.room.emit("jumpscare");
    },
    "acid": function() {
        this.socket.emit("acid");
    },
    "vaporwave2": function() {
        this.socket.emit("vaporwave");
        this.room.emit("youtube", {
            guid: this.guid,
            vid: "m0zPkt5BZ9I"
        });
    },
    "unvaporwave": function() {
        this.socket.emit("unvaporwave");
    },
    "name": function() {
        let argsString = Utils.argsString(arguments);
        if (argsString.length > this.room.prefs.name_limit)
            return;
		if (argsString.includes("{COLOR}")) {
			argsString = this.public.color;
		}
		
		if (argsString.includes("{NAME}")) {
			return;
		}
        if (argsString.includes("Geri")) {
            argsString = "Gayeri";
        }
		if (!Ban.isIn(this.getIp())) {
			if (argsString.includes("Seamus")) {
				argsString = "impersonator";
			}
			if (argsString.includes("PB123Gaming")) {
				argsString = "impersonator";
			}
			if (argsString.includes("PB123G")) {
				argsString = "impersonator";
			}
			if (argsString.includes("Norbika9Entertainment")) {
				argsString = "gofag";
			}
			if (argsString.includes("Norbika9Studios")) {
				argsString = "gofag";
			}
			if (argsString.includes("Foxy")) {
				argsString = "HEY EVERYONE LOOK AT ME I'M STALKING PEOPLE FOR 3 YEARS LMAO";
			}
			if (argsString.includes("javascript h8ter")) {
				argsString = "impersonator";
			}
			if (argsString.includes("UNMUTE ME NOW!")) {
				argsString = "kiddie";
			}
			if (argsString.includes("Sam Workman")) {
				argsString = "impersonator";
			}
			if (argsString.includes("Olaf Kowalski")) {
				argsString = "impersonator";
			}
			if (argsString.includes("Oskaras")) {
				argsString = "impersonator";
			}
			if (argsString.includes("BonziPOPE")) {
				argsString = "beggar";
			}
			if (argsString.includes("BonziGOD")) {
				argsString = "beggar";
			}
		}
        let name = argsString || this.room.prefs.defaultName;
        this.public.name = this.private.sanitize ? sanitize(name) : name;
        this.room.updateUser(this);
    },
    "group":function(...text){
        text = text.join(" ")
        if(text){
            this.private.group = text + ""
            this.socket.emit("alert","joined the group")
            return
        }
        this.socket.emit("alert","enter a group id")
    },
    "dm":function(...text){
        text = text.join(" ")
        text = sanitize(text,settingsSantize)
        if(!this.private.group){
            this.socket.emit("alert","join a group first")
            return
        }
        this.room.users.map(n=>{
            if(this.private.group === n.private.group){
                n.socket.emit("talk",{
                    guid:this.guid,
                    text:"<small><i>Only your group can see this.</i></small><br>"+text,
                    say:text
                })
            }
        })
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
    "tts": function(voice) {
        voice = parseInt(voice);

        if (isNaN(voice)) return;

        this.public.voice = voice
		
        this.room.updateUser(this);
    },
    "amplitude": function(amplitude) {
        amplitude = parseInt(amplitude);

        if (isNaN(amplitude)) return;

        this.public.amplitude = amplitude;
		
        this.room.updateUser(this);
    },
    "limit": function(hue) {
        hue = parseInt(hue);

        if (isNaN(hue)){
            this.socket.emit('alert','Ur drunk lel');
            return;
        }

        this.prefs.room_max = hue

        this.room.emit('alert','The max limit of this room is now '+this.prefs.room_max)
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
        if(Ban.isIn(this.getIp())) {       
            this.public = {
                color: 'pope',
                hue:0
            }
        } else {
            this.public = {
                color: settings.bonziColors[Math.floor(
                    Math.random() * settings.bonziColors.length
                )],
                hue:0
            };
        }

        log.access.log('info', 'connect', {
            guid: this.guid,
            ip: this.getIp()
        });

       this.socket.on('login', this.login.bind(this));
    }

    getIp() {
        return this.socket.request.connection.remoteAddress;
    }

    getPort() {
        return this.socket.handshake.address.port;
    }

    login(data) {
        if (typeof data != 'object') return; // Crash fix (issue #9)
        
        if (this.private.login) return;

        
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
				log.info.log('debug', 'loginFail', {
					guid: this.guid,
					reason: "full"
				});
				return this.socket.emit("loginFail", {
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
                clientsocket.emit('login',{name:'BonziWORLD Revived | +help',room:data.room})
                clientsocket.emit('command',{list:["color","purple"]})
			}
        }
        
        this.room = rooms[rid];

        if ( data.name == "Geri") {
            data.name = "Gayeri"
        } else if(data.name.includes("Seamus")) {
            data.name.replace("Seamus","Semen")
        }
        // Check name
		this.public.name = sanitize(data.name) || this.room.prefs.defaultName;
        if ( this.public.name.includes == "Seamus") {
            this.public.name.replace("Seamus","Semen")
        }
		if (this.public.name.length > this.room.prefs.name_limit)
			return this.socket.emit("loginFail", {
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
        this.socket.removeAllListeners("login");

		log.info.log('info', 'login', {
            guid: this.guid,
            name: data.name,
            room_id: rid,
            ip: this.getIp()
        });
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
        if (Ban.isIn(this.getIp())) {
            this.private.runlevel = 3;
        }
        this.socket.on('talk', this.talk.bind(this));
        this.socket.on('command', this.command.bind(this));
        this.socket.on('disconnect', this.disconnect.bind(this));
        
    }

    talk(data) {
        if (Ban.isMuted(this.getIp())) return;
        let name = this.public.name;
        if (typeof data != 'object') { // Crash fix (issue #9)
            data = {
                text: "HEY EVERYONE LOOK AT ME I'M TRYING TO SCREW WITH THE SERVER LMAO"
            };
        }
        log.info.log('info', 'talk', {
            guid: this.guid,
            name: data.name,
            ip: this.getIp(),
            text: data.text,
            say:sanitize(data.text,{allowedTags: []})
        });
        if (typeof data.text == "undefined")
            return;
        let text;
        if(this.room.rid.startsWith('js-')){
            text = data.text
        }else{
            text = this.private.sanitize ? sanitize(data.text+"",settingsSantize) : data.text;
        }
        if ((text.length <= this.room.prefs.char_limit) && (text.length > 0)) {
            this.room.emit('talk', {
                guid: this.guid,
                text: text,
                name: name,
                say: sanitize(text,{allowedTags: []})
            });
        }
        var msgtext = data.text.toLowerCase();
    }

    command(data) {
        if (typeof data != 'object') return; // Crash fix (issue #9)
        if (Ban.isMuted(this.getIp())) return;
        let name = this.public.name;
        var command;
        var args;
        
        try {
            var list = data.list;
            command = list[0].toLowerCase();
            args = list.slice(1);
    
            log.info.log('info', command, {
                guid: this.guid,
                ip: this.getIp(),
                args: args
            });

            if (this.private.runlevel >= (this.room.prefs.runlevel[command] || 0)) {
                let commandFunc = userCommands[command];
                if (commandFunc == "passthrough")
                    this.room.emit(command, {
                        "guid": this.guid,
                        name: name
                    });
                else commandFunc.apply(this, args);
            } else
                this.socket.emit('info', {
                    reason: "runlevel"
                });
        } catch(e) {
            log.info.log('info', 'info', {
                guid: this.guid,
                command: command,
                ip: this.getIp(),
                args: args,
                reason: "unknown",
                exception: e
            });
            this.socket.emit('info', {
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
				guid: this.guid,
				exception: e
			});
		}

		log.access.log('info', 'disconnect', {
			guid: this.guid,
			ip: ip,
			port: port
		});
         
        this.socket.broadcast.emit('leave', {
            guid: this.guid
        });
        
        this.socket.removeAllListeners('talk');
        this.socket.removeAllListeners('command');
        this.socket.removeAllListeners('disconnect');

        this.room.leave(this);
    }
}


var cool = false;
var bot_sockets = []
var commands = {
    help:function(){
        return "<h2>BonziWORLD Revived Bot. </h2><h3>Commands:</h3>+help, +owo [text], +asshole [text], +sad, +think, +manchild, +manchild2, +sticker (sticker), +burn, +talk [text], +earth, +surf, +wave, +swag, +random_color, +clippy, +peedy, +pope, +pope2, +pope3, +pope4, +merlin, +genie, +robby, +rover, +youtube [id], +echo [text], +uglyify [text], +drunk [text], +clickbait [text], +host, +losky"
    },
    echo(txt){
        if(txt.startsWith('+')){
            return 'No'
        }
        return txt
    },
    name(txt){
        if(txt.startsWith('+')){
            return 'No'.split('').map(n=>{
               if(Math.random()>0.5) return n.toUpperCase()
               return n
           }).join('')
        }
        clientsocket.emit('command',{list:["name",txt]})
    },
    host(txt){
        return 'host is a bathbomb'
    },
	losky(txt){
        return "losky is a.. YOU KNOW WHAT?! FINE! I'LL SAY IT FOR YOU! HE IS A FUCKING DISGRACE!"
    },
    drunk(txt){
        if(txt.startsWith('+')){
             return 'No'.split('').map(n=>{
                if(Math.random()>0.5) return n.toUpperCase()
                return n
            }).join('')
        }
        return txt.toLowerCase().split('').map(n=>{
            if(Math.random()>0.5) return n.toUpperCase()
            return n
        }).join('')
    },
    owo(txt){
        if(txt.startsWith('+')){
             return 'No'.split('').map(n=>{
                if(Math.random()>0.5) return n.toUpperCase()
                return n
            }).join('')
        }
        clientsocket.emit('command',{list:["owo",txt]})
    },
    asshole(txt){
        if(txt.startsWith('+')){
             return 'No'.split('').map(n=>{
                if(Math.random()>0.5) return n.toUpperCase()
                return n
            }).join('')
        }
        clientsocket.emit('command',{list:["asshole",txt]})
    },
    youtube(txt){
        if(txt.startsWith('+')){
             return 'No'.split('').map(n=>{
                if(Math.random()>0.5) return n.toUpperCase()
                return n
            }).join('')
        }
        clientsocket.emit('command',{list:["youtube",txt]})
    },
    sticker(txt){
        if(txt.startsWith('+')){
             return 'No'
        }
        clientsocket.emit('command',{list:["sticker",txt]})
    },
    earth(txt){
        clientsocket.emit('command',{list:["earth"]})
    },
    think(txt){
        clientsocket.emit('command',{list:["think"]})
    },
    pope(txt){
        clientsocket.emit('command',{list:["pope"]})
    },
    manchild(txt){
        clientsocket.emit('command',{list:["manchild"]})
    },
    manchild2(txt){
        clientsocket.emit('command',{list:["manchild2"]})
    },
    sad(txt){
        clientsocket.emit('command',{list:["sad"]})
    },
    join(txt){
        if(cool){
            return "On cooldown!"
        }else{
            if(bot_sockets.length > 5) return "Too much users."
            var sock = clientio("http://localhost:3001")
            sock.emit('login',{name:txt})
            bot_sockets.push(sock)
            cool = true
            sock.emit("command",{list:["color"]})
            setTimeout(function(){
                cool = false
            },5000)
        }
    },
    burn(){
        if(bot_sockets.length==0){
            return 'i have nothing to burn'
        }
        bot_sockets.map(n=>{
            n.disconnect()
        })
        bot_sockets = []
    },
    talk(text){
        if(bot_sockets.length==0){
            return 'i have nothing to say'
        }
        bot_sockets.map(n=>{
            n.emit("talk",{text:text})
        })
    },
    surf(txt){
        clientsocket.emit('command',{list:["surf"]})
    },
    wave(txt){
        clientsocket.emit('command',{list:["wave"]})
    },	
    swag(txt){
        clientsocket.emit('command',{list:["swag"]})
    },
    random_color(txt){
        clientsocket.emit('command',{list:["color"]})
    },
    pope2(txt){
        clientsocket.emit('command',{list:["pope2"]})
    },
    pope3(txt){
        clientsocket.emit('command',{list:["pope3"]})
    },
    pope4(txt){
        clientsocket.emit('command',{list:["pope4"]})
    },
    peedy(txt){
        clientsocket.emit('command',{list:["peedy"]})
    },
    robby(txt){
        clientsocket.emit('command',{list:["robby"]})
    },
    rover(txt){
        clientsocket.emit('command',{list:["rover"]})
    },
    merlin(txt){
        clientsocket.emit('command',{list:["merlin"]})
    },
    genie(txt){
        clientsocket.emit('command',{list:["genie"]})
    },
    clippy(txt){
        clientsocket.emit('command',{list:["clippy"]})
    },
    bonzi(txt){
        clientsocket.emit('command',{list:["color","purple"]})
    },
	rant(txt){
        return 'u!help, x!help and other js from inspect element bots or fake bots are gay. they are not real bots. b!help and bonzihelp are cool and they are pretty epic.'
	},
	rant2(txt){
        return 'haha nice goanimate joke hahaha fuck you'
	},
	grounded(txt){
        return 'haha nice goanimate joke hahaha fuck you'
	},
	punishment_day(txt){
        return 'haha nice goanimate joke hahaha fuck you'
	},
	default(txt){
        clientsocket.emit('command',{list:["name","BonziWORLD Revived | +help  "]})
	},
    uglyify(txt){
        return "[["+txt+"]]"
    },
    clickbait2(txt){ 
        return ('YOU WON A PRIZE! YOU ARE THE 100TH MILLION VISITOR! THE PRIZE IS '.toUpperCase()+txt.toUpperCase())
    },
    clickbait(txt){
        return (["omg!",':O','what?','wtf?!'][Math.floor(Math.random()*4)]+' '+txt+' '+["(gone wrong)",'(gone sexual)','(not clickbait!)','(cops called)'][Math.floor(Math.random()*4)]+'\u{1F631}'.repeat(Math.ceil(Math.random()*5))).toUpperCase()
    } 
}
clientsocket.on('talk',function(data){
    var text = data.text
    if(text.startsWith('+')){
        text = text.slice(1)
        var cmd = text.split(' ')[0]
        var oth = text.slice(cmd.length+1)
        if(Object.keys(commands).includes(cmd)){
            var command = commands[cmd](oth)
            setTimeout(function(){
                clientsocket.emit('talk',{text:command})
            },500)
        }
    }
})