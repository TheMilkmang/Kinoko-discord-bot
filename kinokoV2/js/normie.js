var config = require('./json/config.json');
var save = require('./js/save.js');

var state = "queue";
var users = [];
var normie = [];
var time = "day";
var playChannel = config.playChannel;
var roles = {depresso: "depresso",
			 schizophrenic: "schizophrenic",
			 anon: "anon",
			 psycho: "psycho",
			 doxxer: "doxxer",
			 fake: "fake"};


exports.setPlayChannel = function(message){
	playChannel = message.channel;
	config.playChannel = message.channel;
	save.jsonSave(config, 'config.json');
};

exports.joinGame = function(message){
	if(state == "playing"){
		message.channel.sendMessage("Please wait until the current game is over to join!");
		return;
	}
	if(!users.includes(message.user)){
		users.push(message.user);
		playChannel.sendMessage(message.user + " has joined the queue!");
	}else{
		message.channel.sendMessage("You are already in the queue!");
	}
};

exports.leaveGame = function(message){
	var playerIndex = -1;
	if(state == "queue"){
		if(!users.includes(message.user)){
			message.channel.sendMessage("You were never in the queue to begin with!");
			return;
		}
	}
	if(state == "playing"){
		if(users.includes(message.user)){
			playChannel.sendMessage(message.user + " has left the game and is now dead.");
			//check role and end game if it was the last normie or depresso
			//kill player
		}
	}
	playerIndex = users.indexOf(message.user);
	users.splice(playerIndex, 1);
};

function depressoVote(message){

}

function normieVote(message){
}

var Player = function(user){
	this.user = user;
	this.alive = true;
	
	

};

Player.prototype.kill = function(){
	this.alive = false;
	
};