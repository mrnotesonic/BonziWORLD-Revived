var loadQueue = new createjs.LoadQueue();
var loadDone = [];
var loadNeeded = [
	"bonziBlack",
	"bonziBlue",
	"bonziBrown",
	"bonziGreen",
	"bonziPurple",
	"bonziRed",
	"bonziPink",
	"bonziYellow",
	"bonziOrange",
	"bonziWhite",
	"bonziDarkPurple",
	"unbojih",
	"grey",
	"clippy",
	"guestgal",
	"cyan",
	"Losky",
	"bonziPeedy",
	"owner",
	"topjej"
];

$(window).load(function() {
	$("#login_card").show();
	$("#login_load").hide();

	loadBonzis();
});

function loadBonzis(callback) {
	loadQueue.loadManifest([
		{id: "bonziBlack", src:"./img/bonzi/black.png"},
		{id: "bonziBlue", src:"./img/bonzi/blue.png"},
		{id: "bonziBrown", src:"./img/bonzi/brown.png"},
		{id: "bonziPeedy", src:"./img/bonzi/peedy.png"},
		{id: "bonziGreen", src:"./img/bonzi/green.png"},
		{id: "owner", src:"./img/bonzi/owner.png"},
		{id: "bonziPurple", src:"./img/bonzi/purple.png"},
		{id: "bonziCyan", src:"./img/bonzi/cyan.png"},
		{id: "clippy", src:"./img/bonzi/clippy.png"},
		{id: "Losky", src:"./img/bonzi/losky.png"},
		{id: "unbojih", src:"./img/bonzi/unbojih.png"},
		{id: "guestgal", src:"./img/bonzi/guestgal.png"},
		{id: "bonziGrey", src:"./img/bonzi/grey.png"},
		{id: "bonziRed", src:"./img/bonzi/red.png"},
		{id: "bonziPink", src:"./img/bonzi/pink.png"},
		{id: "bonziYellow", src:"./img/bonzi/yellow.png"},
		{id: "bonziOrange", src:"./img/bonzi/orange.png"},
		{id: "bonziWhite", src:"./img/bonzi/white.png"},
		{id: "bonziDarkPurple", src:"./img/bonzi/dark_purple.png"},
		{id: "topjej", src:"./img/misc/topjej.png"}
	]);
	loadQueue.on("fileload", function(e) {
		loadDone.push(e.item.id);
	}, this);
	if (callback)
		loadQueue.on("complete", callback, this);
}