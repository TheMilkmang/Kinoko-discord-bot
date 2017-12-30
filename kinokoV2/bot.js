const Discord = require('discord.js');
var config = require('./json/config.json');
var bank = require('./js/bank.js');
var kms = require('./js/suicide.js');
var flip = require('./js/flip.js');
var work = require('./js/work.js');
var save = require('./js/save.js');
var bomb = require('./js/bomb.js');
var balloon = require('./js/balloon.js');
var waifu = require('./js/waifu.js');

var botpost = -1;
const bot = new Discord.Client();

bot.on('ready', () => {
	console.log('I am ready!');
	botpost = bot.channels.get("231252749218611200");
});

bot.on('message', message => {
	if(message.channel.type == 'text'){
		var botRole = message.guild.roles.find('name', 'Bot');
	}

	if (message.author.bot) return;
	if(message.member){
		if (message.member.roles.has(botRole.id)) return;
	}
	
	if(message.content == ']unmute') {
		unmuteChan(message);
	}
	
	for(i = 0; i < config.mutedChannels.length; i++){
		if(config.mutedChannels[i] == message.channel.name){
			if(message.content != ']unmute'){
				return;
			}
		}
	}
	
	if( message.content == ']mute') {
		muteChan(message);
	}
	
	if (message.content == ']test') {
		sendMessage(message.channel, 'toast');
	}
	
	if(message.content == ']help') {
		sendMessage(message.channel, "Here's my documentation, officer. <https://pastebin.com/tqYe1KrX>");
	}
	
	if(message.content.startsWith(']addMethod ')) {
		sendMessage(message.channel, kms.add(message, "method"));
	}
	
	if(message.content.startsWith(']addSuccess ')){
		sendMessage(message.channel, kms.add(message, "success"));
	}
	
	if(message.content.startsWith(']addFail ')){
		sendMessage(message.channel, kms.add(message, "fail"));
	}
	
	if (message.content.startsWith(']kms')) {
		sendMessage(message.channel, kms.attemptSuicide(message.author));
	}
	
	if(message.content.startsWith(']mushies') || message.content == ']m'){
		var balance = bank.getBalanceUser(message.author);
		if(message.mentions.users.first()){
			balance = bank.getBalanceUser(message.mentions.users.first());
			sendMessage(message.channel, message.mentions.users.first().username + " has " + balance + config.currency);
			return;
		}
		
		sendMessage(message.channel, "You have " + balance + config.currency);
	}
	
	if(message.content.startsWith(']send ')){
		var fromUser = message.author;
		var array = message.content.split(' ');
	
		if(array.length != 3) return;
		if(array[1].startsWith('<@')) return;
	
		if(!message.mentions.users.first()){
			console.log("no mention");
			return;
		}else{ 
			var toUser = message.mentions.users.first();
		}
		
		var amount = parseInt(array[1]);
		if(amount >= 0){}else return;
		
		if(bank.sendMushies(fromUser, toUser, amount)){
			sendMessage(message.channel, fromUser.username + " sent " + amount + config.currency + " to " + toUser.username);
		}
	}
	
	if(message.content.startsWith(']work') || message.content == ']w'){
		sendMessage(message.channel, work.mushiesWork(message.author, bank));
	}
	
	if(message.content.startsWith(']top')){
		var args = message.content.split(' ');
		var amount = 5;
		if(args.length == 2){
			amount = parseInt(args[1]);
			if(!amount){
				amount = 5;
			}
		}
		var array = work.topWorkers(bank, amount);
		var namesText = "";
		
		for(i = 0; i<array.length; i++){
			namesText = namesText + '\n' + (i+1) + ') ' + array[i].name + "  --- " + array[i].totalWorked + config.currency;
		}
		sendMessage(message.channel, "Here are what the best workers have earned for the kingdom. Aspire to be like them!" + namesText);
	}
	
	if(message.content.startsWith(']laziest')){
		var args = message.content.split(' ');
		var amount = 5;
		if(args.length == 2){
			amount = parseInt(args[1]);
			if(!amount){
				amount = 5;
			}
		}
		var array = work.laziestWorkers(bank, amount);
		var namesText = "";
		
		for(i = 0; i < array.length; i++){
			namesText = namesText + '\n' + (i+1) + ') ' + array[i].name + "  --- " + array[i].totalWorked + config.currency;
		}
		sendMessage(message.channel, "Here are the laziest workers. *Encourage* them to work harder!" + namesText);
	}
	
	if(message.content.startsWith(']greediest')){
		var args = message.content.split(' ');
		var amount = 5;
		if(args.length == 2){
			amount = parseInt(args[1]);
			if(!amount){
				amount = 5;
			}
		}
		var array = bank.getRichest(amount);
		var namesText = "";
		for(i = 0; i<array.length; i++){
			namesText = namesText + '\n' + (i+1) + ') ' + array[i].name + "  --- " + array[i].balance + config.currency;
		}		
		sendMessage(message.channel, "Here are the richest workers. Tell them to share!" + namesText);
	}
	
	if(message.content.startsWith(']poorest')){
		var args = message.content.split(' ');
		var amount = 5;
		if(args.length == 2){
			amount = parseInt(args[1]);
			if(!amount){
				amount = 5;
			}
		}
		var array = bank.getPoorest(amount);
		var namesText = "";
		for(i = 0; i<array.length; i++){
			namesText = namesText + '\n' + (i+1) + ') ' + array[i].name + "  --- " + array[i].balance + config.currency;
		}		
		sendMessage(message.channel, "Here are the poorest workers. Share with your comrades!" + namesText);
	}
		
	if(message.content.startsWith(']totalWorked')){
		sendMessage(message.channel, message.author.username + " has earned a total of " + bank.getTotalWorkedUser(message.author) + config.currency + " for their kingdom. Good job, comrade.");
	}
	
	if(message.content.startsWith(']bf ALL ')){
		sendMessage(message.channel, flip.betFlipAll(message, bank));
		return;
	}
	
	if(message.content.startsWith(']bf ')){
		sendMessage(message.channel, flip.betFlip(message, bank));
	}
	
	
	if(message.content.startsWith(']population')){
		sendMessage(message.channel, "The " + config.currency + " kingdom has " + bank.getPopulation() + " members! Go tell everyone you know to do `]mushies` to increase the population!");
	}
	
	if(message.content.startsWith(']harvest') || message.content == ']h' || message.content.startsWith(']h ')){
		var array = message.content.split(' ');
		if(array.length > 2) return;
		if(array.length == 2){
			var choice = parseInt(array[1]);
			if(choice > 0){
				choice -= 1;
			}else return;
		}
		sendMessage(message.channel, work.harvest(message.author, bank, choice));
	}
	
	if(message.content == ']bomb'){
		sendMessage(message.channel, bomb.printBomb());
	}
	if(message.content == ']balloon'){
		sendMessage(message.channel, balloon.printBalloon(bank));
	}
	if(message.content == ']buyballoon'){
		sendMessage(message.channel, balloon.buyBalloon(bank, message.channel, message.author));
	}
	if(message.content == ']buybomb'){
		sendMessage(message.channel, bomb.buyBomb(bank, message.author));
	}
	
	if(message.content == ']normie join'){
		normie.normieJoin(message);
	}
	
	if(message.content == ']egg'){
		sendMessage(message.channel, "An egg costs " + waifu.getPrice() + config.currency);
	}
	
	if(message.content == ']buyegg'){
		if(bank.subtractBalanceUser(message.author, waifu.getPrice())){
		   sendMessage(botpost, waifu.buyEgg(message));
		}
	}
	
	if(message.content == ']waifus'){
		sendMessage(botpost, waifu.getInventory(message.author));
	}
});

function sendMessage(channel, message){
	if(!channel.muted){
		console.log("LOGGING chANneL" + channel + "CHANNEL LOGGED\n Message: " + message);
		channel.send(message);
	}
}

function muteChan(message){
	this.modRole = message.guild.roles.find('name', 'Discord Mods');
	this.smolRole = message.guild.roles.find('name', 'Smol Mods');
	
	if( message.member.roles.has(this.modRole.id) || message.member.roles.has(this.smolRole.id) || message.author.username == "meeseeks") {
		config.mutedChannels.push(message.channel.name);
		save.jsonSave(config, 'config.json');
		message.channel.send("Ok, I won't speak in this channel anymore.");
	}
}

function unmuteChan(message){
	this.modRole = message.guild.roles.find('name', 'Discord Mods');
	this.smolRole = message.guild.roles.find('name', 'Smol Mods');
	
	if( message.member.roles.has(this.modRole.id) || message.member.roles.has(this.smolRole.id) || message.author.username == "meeseeks") {
		config.mutedChannels.splice(i, 1);
		save.jsonSave(config, 'config.json');
		message.channel.send("*gasps for air* \nFinally!");
	}
}

function update(){
	var message = waifu.updateAll();
	if(message){
		sendMessage(botpost, message);
	}
	setTimeout(update, 60000);
}
setTimeout(update, 60000);


bot.login(config.token);