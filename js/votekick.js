exports.Discord;

var config = require('../json/config.json');
var save = require('./save.js');

var VK = require('../json/votekick.json');
VK.messages = [];
var banEmoji = "beand";
var banAmount = 7;
var kinURL = 'https://cdn.discordapp.com/avatars/401684543326781440/84ec659dcd53cdcd68baf6c8f5210058.png'

exports.bot = {};
exports.modlogs;
exports.apply = function(message){
	message.reply("Votekick opt-in is now role-based. type `.iam votekick` to opt in.");
	return;

	if(VK.blacklist.includes(message.author.id)){
		message.reply("I'm sorry " + message.author.username + ", I'm afraid I can't do that.")
		return;
	}

	if(VK.users.includes(message.author.id)){
		message.reply("You have already opted-in to the votekick feature. To opt out, type in the command that opts you out.")
		return;
	}

	VK.users.push(message.author.id);
	save.jsonSave(VK, "votekick.json")
	message.reply("Thanks for opting into the completely voluntary opt-in-votekick-by-beand-react experiment! To votekick somebody who has opted in they need " + banAmount + " beand reacts from *anyone at all*. Have fun. By the way you can't opt out until you get kicked tee-hee~");
	return;

};

exports.addBlackList = function(userID){
	if(VK.blacklist.includes(userID)){
		console.log("user already on blacklist");
		return("They were already blacklisted m8");
	}

	if(VK.users.includes(userID)){
		VK.users.splice(VK.users.indexOf(userID), 1);
		save.jsonSave(VK, "votekick.json");
		console.log("removed blacklisted user " + userID + " from userlist");
	}
	VK.blacklist.push(userID);
	return("Ok I've blacklisted user ID " + userID);
}

exports.listUsers = function(){
	return;
	var string = "Here are the people opted into the votekick-by-opt-in-beand-reaction experiment: "
	for(var i = 0; i < VK.users.length; i++){
		try{
			string += "\n" + VK.users[i] + " ";
			string += exports.bot.users.get(VK.users[i]).username;
		}
		catch(err){
			console.log(err);
		}	
	}
	return string;
}

function countReacts(reaction){
	var count = reaction.users.filterArray(user => VK.users.includes(user.id));
	console.log("countReacts: " + count.length);
	return count.length;
}

exports.checkReactionAdd = function(reaction){
	if(VK.messages.includes(reaction.message.id)){
		console.log("message has already been votekicked before");
		return false;
	}
	if(reaction.message.member === null) return false;

	if(!reaction.message.member.roles.has('462446699621777418')) {
		console.log("author doesn't have votekick role");
		return false;
	}

	if(reaction.emoji.name != banEmoji){
		console.log("Not a beand, emoji name is " + reaction.emoji.name);
		return false;
	}

	if(reaction.count >= banAmount){
		var optedReacts = countReacts(reaction);
	}else{
		console.log("reaction count less than ban amount");
		return false;
	}

	if(reaction.count >= banAmount){ //optedReacts
		console.log("opted reacts more than ban amount, kicking...");
		reaction.message.reply("You've just been votekicked for this.");
		//VK.users.splice(VK.users.indexOf(reaction.message.author.id), 1);
		save.jsonSave(VK, "votekick.json");
		//logKick(reaction);
		kick(reaction.message.member);
		VK.stats.kicks.push(`votekicked ${reaction.message.author.tag} for ${reaction.message.content}`);
		VK.messages.push(reaction.message.id);
		return true;
	}else{
		console.log("opted reacts less than ban amount: " + reaction.count);
		return false;
	}

};

function kick(member){
	member.kick("votekicked")
		.then( () => console.log("kicked " + member.user.username))
		.catch(console.error);
}

function logKick(reaction){
	if(reaction.message.author.avatarURL == null){
		var url = kinURL;
	}else{
		var url = reaction.message.author.avatarURL.split('?')[0];
	}

	if(reaction.message.attachments.size){
		var imgUrl = reaction.message.attachments.first().url;
	}else{
		var imgUrl = ' ';
	}

	var embed = new exports.Discord.RichEmbed()
	.setColor("#AA0000")
	.setTimestamp()
	.setAuthor(`${reaction.message.author.tag}  was votekicked for `, url)	
	.setDescription(`${reaction.message.content} <${imgUrl}>`);
			

	VK.stats.kicks.push(`votekicked ${reaction.message.author.tag} for ${reaction.message.content}`);
	console.log("sending message to modlogs: " + JSON.stringify(embed));
	exports.modlogs.send("test", {embed});

}