const Discord = require('discord.js');

var fs = require('fs');
var save = require('./save.js');

exports.Rentarole = function(bot, guild, channel, bank){
	this.bot = bot;
	this.guild = guild;
	this.guildID = guild.id;
	this.bank = bank;
	this.channel = channel;

	this.checkForConfig();

};

exports.Rentarole.prototype.checkForConfig = function(){
	var file = `./json/rentarole.json`;

	if(save.exists(file)){
		this.conf = require('.' + file);
		console.log("loaded rentarole json");
		this.activeMap = new Map(this.conf.activeRoles);
		return;
	}else{
		this.makeNewConf();
		return;
	}
}

exports.Rentarole.prototype.makeNewConf = function(){
	this.conf = {
		activeRoles: [[]],
		price: 10000,
		sharePrice: 2500
	}
	this.activeMap = new Map();
	this.save();
};

exports.Rentarole.prototype.save = function(){
	this.conf.activeRoles = [...this.activeMap];
	save.jsonSave(this.conf, `rentarole.json`);
};

exports.Rentarole.prototype.getPrice = function(){
	return this.conf.price;
}

exports.Rentarole.prototype.setPrice = function(newPrice){
	this.conf.price = newPrice;
	this.save();
	return;
}

exports.Rentarole.prototype.setSharePrice = function(newPrice){
	this.conf.sharePrice = newPrice;
	this.save();
	return;
}

exports.Rentarole.prototype.rentNew = function(message){
	if(this.activeMap.has(message.author.id)){
		message.reply(" You are already renting a role! Change its name or color if you like.");
		return;
	}

	var args = message.content.split(' ');
	var days = parseInt(args[1]);
	var price = days * this.conf.price;

	if(isNaN(days) || days <= 0){
		message.reply(" ]rentarole <numer of days at " + this.conf.price + ":mushroom: per day>");
		return;
	}

	if(days > 10){
		message.reply("Sorry, you can only rent for 10 days at a time currently!");
		return;
	}

	if(this.bank.getBalanceUser(message.author) < price){
		message.reply(" You don't have enough for that many days.");
		return;
	}

	this.bank.subtractBalanceUser(message.author, price);

	this.guild.createRole({
		name: message.author.username,
		position: this.guild.roles.size - 15
	})
	.then(role => {
		var d = new Date();
		var ms = d.getTime();
		ms += (86400000 * days);
		//ms += (60000 * days);
		message.member.addRole(role.id);

		this.activeMap.set(message.author.id, {
			roleID: role.id,
			userID: message.author.id,
			expiration: ms
		})

		message.reply(`You rented a role for ${days} days for ${price}:mushroom:! Use the commands to change the name and color to change the name and color. Thanks for using Kinoko Rent-A-Role!`);

		this.save();
	})

}

exports.Rentarole.prototype.changeName = function(message){
	var name = message.content.split(' ').slice(1).join(' ');
	if(name.length < 1){
		message.reply("enter a valid name");
		return;
	}
	if(this.activeMap.has(message.author.id)){
		var r = this.activeMap.get(message.author.id)
		this.guild.roles.get(r.roleID).setName(name);
		message.channel.send("Okay your rent-a-role is now called " + name);
	}else{
		message.reply(" You are not renting a role right now...");
		return;
	}
}

exports.Rentarole.prototype.changeColor = function(message){
	var args = message.content.split(' ');
	if(args[1].length < 1){
		message.reply("enter a valid color in hex format. i.e #FF00FF for purple.");
		return;
	}
	if(this.activeMap.has(message.author.id)){
		var r = this.activeMap.get(message.author.id)
		this.guild.roles.get(r.roleID).setColor(args[1]);
		message.channel.send("Okay your rent-a-role is now colored " + args[1]);
	}else{
		message.reply(" You are not renting a role right now...");
		return;
	}
}

exports.Rentarole.prototype.timeLeft = function(message){
	var d = new Date();
	var ms = d.getTime();

	if(!this.activeMap.has(message.author.id)){
		message.reply("Your rent-a-role is expired.");
		return;
	}

	var timeLeft = this.activeMap.get(message.author.id).expiration - ms;
	message.channel.send(`${message.author.username} You have ${timeLeft/60000/60} hours before your role expires.`);
	return;
}

exports.Rentarole.prototype.listRentshare = function(message){
	var d = new Date();
	var ms = d.getTime();
	var str = "Can't afford to rent your own role? Rent somebody else's! It currently costs " + this.conf.sharePrice + ":mushroom: per day that the role exists. Do `]buyrentshare owner#1234` of the person whose role you want to rent.\n"
	this.activeMap.forEach(role => {
		var hours = (role.expiration - ms)/60000/60;
		var days = hours/24
		var price = Math.round(days * this.conf.sharePrice);
		if(this.bot.users.has(role.userID)){
			var owner = this.bot.users.get(role.userID).tag;
			str += `Name: **${this.guild.roles.get(role.roleID).name}** Owner: ${owner} Price: **${price}**:mushroom: Time Left: **${Math.round(hours)} hours**\n`
		}
	});
	message.channel.send(str);
}

exports.Rentarole.prototype.buyRentshare = function(message){
	var args = message.content.split(' ');
	var arg = args.slice(1).join(' ');
	var d = new Date();
	var ms = d.getTime();
	var hasTag = false;
	var role;
	this.activeMap.forEach(r => {
		var tag = this.bot.users.get(r.userID).tag;
		if(tag == arg){
			hasTag = true;
			role = r;
		}
	})

	if(!hasTag){
		message.reply(" Do ]rentshare to see the available roles you can rent. And then `]buyrentshare owner#1234` of the person whose role you want to rent. Or ]rent-a-role to see how to make a new one.");
		return;
	}

	var hours = (role.expiration - ms)/60000/60;
	var days = hours/24
	var price = Math.round(days * this.conf.sharePrice);

	if(this.bank.getBalanceUser(message.author) < price){
		message.reply(`That role costs ${price}:mushroom: to rent. You don't have enough!`);
		return;
	}

	if(price < 0){
		message.reply(` That role is about to expire, you can't buy it right now sorry.`);
		return;
	}

	this.bank.subtractBalanceUser(message.author, price);
	message.member.addRole(role.roleID);
	message.channel.send(`Okay you've rented ${this.guild.roles.get(role.roleID).name} for ${price}:mushroom:! It expires in ${hours} hours.`);


}

exports.Rentarole.prototype.checkRoles = function(){
	var d = new Date();
	var ms = d.getTime();
	var changed = false;
	this.activeMap.forEach( (value, key, map) => {
		if(value.expiration < ms){
			this.guild.roles.get(value.roleID).delete();
			var user = this.guild.members.get(value.userID);
			this.channel.send(user + " your rent-a-role has expired! Thanks for using Kinoko Rent-A-Role! Be sure to also check out our Rent-A-Hole feature ;)");
			map.delete(key);
			changed = true;
		}
	})
	if(changed){
		this.save();
	}
}
