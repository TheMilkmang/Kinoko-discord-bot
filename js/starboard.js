const Discord = require('discord.js');

var config = require('../json/config.json');
var save = require('./save.js');
var starlog = require('../json/starlog.json');
//var starlog = {stars: [], blacklist: []};
//save.jsonSave(starlog, "starlog.json");

/*
	{
		userID:
		username:
		messageContent:
		messageID:
		messageChannelID: 
		attachments:
		avatarURL:
		starMessageID:
		reactions: [ {
			reaction: (reaction.toString()),
			count:
		}
	}
*/

exports.Starboard = function(bot, hook, starChannel, threshold, guild){
	this.bot = bot;
	this.hook = hook;
	this.starChannel = starChannel;
	this.threshold = threshold;
	this.guildID = guild;
	this.queue = [];

	if(starlog.stars.length > 0){
		this.starsmap = new Map(starlog.stars);
	}else{
		this.starsmap = new Map();
	}
	var self = this;
	setInterval(function(){
		self.doQueue();
	}, 10000);

};

exports.Starboard.prototype.save = function(){
	starlog.stars = [...this.starsmap];
	save.jsonSave(starlog, "starlog.json");
}

exports.Starboard.prototype.toggleChannel = function(message){
	
	if(!message.member.permissions.has("ADMINISTRATOR")){
		message.reply(" I'm sorry, I can't let you do that.");
		return;
	}

	if(starlog.blacklist.includes(message.channel.id)){
		message.reply("Ok I'll track reactions in this channel now.");
		starlog.blacklist.splice(starlog.blacklist.indexOf(message.channel.id), 1);
		this.save();
		return;
	}else{
		message.reply("Ok I won't track reactions in here anymore.");
		starlog.blacklist.push(message.channel.id);
		this.save();
		return;
	}


}

exports.Starboard.prototype.checkReaction = function(reaction){
	//console.log(`identifier: ${reaction.emoji.identifier} name: ${reaction.emoji.name} id: ${reaction.emoji.id} tostring: ${reaction.emoji.toString()}`);

	if(reaction.count < this.threshold){
		console.log("reaction count less than threshold for star board");
		return;
	}

	if(starlog.blacklist.includes(reaction.message.channel.id)){
		console.log("starlog is disabled in this channel");
		return;
	}

	if(reaction.emoji.name == "beand"){
		console.log("beand emoji, no starbord");
		return;
	}

	if(reaction.emoji.hasOwnProperty('animated')){
		if(reaction.emoji.animated){
			console.log("animated emoji, not logging");
			return;
		}
	}
	

	if(!this.bot.emojis.has(reaction.emoji.id)){
		if(reaction.emoji.id === null){
			console.log("id is null it should work");
		}else{
			console.log("bot doesn't have emoji");
			return;
		}
	}

	var star = {};

	if(this.starsmap.has(reaction.message.id)){
		var starExists = true;
		star = this.starsmap.get(reaction.message.id);
		console.log("star exists");
	}
	else{
		var starExists = false;
	}

	if(starExists){
		
		for(var i = 0; i < star.reactions.length; i++ ){
			//if the emoji is already in the star object
			if(star.reactions[i].reaction == reaction.emoji.toString()){
			
				if(star.reactions[i].count >= reaction.count){
					console.log("star count is more than reaction count");
					return;
				}else{
					console.log("reaction count is more than star count. Trying to update.");
					star.reactions[i].count = reaction.count;
					this.save();
					this.addQueue(star);
					//this.updateStarMessage(star);
					return;
				}
			}
		}
		//if the emoji isn't yet
		star.reactions.push({
			reaction: reaction.emoji.toString(),
			count: reaction.count
		})
		this.save();
		this.addQueue(star);
		//this.updateStarMessage(star);
		return;
	}

	this.newStar(reaction);
	return;


};

exports.Starboard.prototype.addQueue = function(star){
	if(this.queue.includes(star)) return;
	this.queue.push(star);
};

exports.Starboard.prototype.doQueue = function(){
	let star;
	if(this.queue.length){
		star = this.queue[0];
	}else return;
	this.updateStarMessage(star);
	this.queue.shift();
	return;
}
exports.Starboard.prototype.updateStarMessage = function(star){
	console.log("attempting star edit");

	var desc = '';

	for(var i = 0; i < star.reactions.length; i++){
		desc += ` **${star.reactions[i].count}** _what the fuck ${star.reactions[i].reaction} _ `;
	}
	console.log("desc: " + desc);
	var embed = this.makeEmbed(star);
	this.starChannel.fetchMessage(star.starMessageID)
	.then( msg => {
		console.log("star message found, now to delete");
		msg.delete()
		.then(console.log("message deleted"))
		.catch(console.error);
		var files = [...star.attachments];
		this.hook.send(star.messageContent, {
			username: star.username,
			avatarURL: star.avatarURL,
			disableEveryone: true,
			embeds: [embed],
			files: files

		})
		.then(msg2 => {
			console.log("sent updated webhook");
			star.starMessageID = msg2.id;
			
		})
		.catch(console.error);
	})
	.catch(console.error);
};

exports.Starboard.prototype.newStar = function(reaction){
	var message = reaction.message;
	var count = reaction.count;
	var attachments = [];
	message.attachments.forEach(att => attachments.push(att.url));
	console.log("attachments: " + attachments);
	if(message.author.avatarURL == null) return;
	var star = {
		userID: message.author.id,
		username: message.author.username,
		messageContent: message.content,
		messageID: message.id,
		messageChannelID: message.channel.id,
		attachments: attachments,
		avatarURL: message.author.avatarURL.split('?')[0],
		reactions: [{
			reaction: reaction.emoji.toString(),
			count: count
		}]
	};
	var embed = this.makeEmbed(star);
	
	var files = [...attachments];
	this.hook.send(star.messageContent, {
			username: star.username,
			avatarURL: star.avatarURL,
			disableEveryone: true,
			embeds: [embed],
			files: files

		})
		.then(msg => {
			console.log("sent webhook");
			star.starMessageID = msg.id;
		})
		.catch(console.error);

		this.starsmap.set(star.messageID, star);
		this.save();
};

exports.Starboard.prototype.makeEmbed = function(star){
	var desc = '';
	for(var i = 0; i < star.reactions.length; i++){
		desc += `**${star.reactions[i].count}** ${star.reactions[i].reaction} `;
	}
	var embed = new Discord.RichEmbed()
	.setColor("#AA0000")
	.setDescription(desc);
	//.setTitle("Jump to message")
	//.setURL("https://discordapp.com/channels/" + this.guildID + "/" + star.messageChannelID + "/" + star.messageID);
	//.setDescription("https://discordapp.com/channels/" + this.guildID + "/" + star.messageChannelID + "/" + star.messageID);
	//.setDescription("[Jump to message](https://discordapp.com/channels/" + this.guildID + "/" + star.messageChannelID + "/" + star.messageID + ")");
	return(embed);
}