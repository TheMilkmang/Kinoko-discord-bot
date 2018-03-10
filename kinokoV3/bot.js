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
var exchange = require('./js/exchange.js');
var tts = require('./js/tts.js');
var ceelo = require('./js/ceelo.js');
var avatar = require('./js/avatar.js');
var spin = require('./js/spin.js');

var botpost;
var bellpost;
var chanGeneral;
var trashpost;
var cgame;

const bot = new Discord.Client();



bot.on('ready', () => {
	console.log('I am ready!');
	
	botpost = bot.channels.get(config.botPostID);
	bellpost = bot.channels.get(config.bellPostID);
	chanGeneral = bot.channels.get(config.generalID);
	trashpost = bot.channels.get('197198331817099266');
	cgame = new ceelo.Ceelo(botpost, {name: "mushrooms", emoji: ":mushroom:"}, 5);
	pcgame = new ceelo.Ceelo(botpost, {name: "Ujin Currency", emoji: "<:pretzel:363385221976162304>"}, 5);	
	chanGeneral.fetchMessages({ limit: 15 })
  .then(messages => console.log(`Received ${messages.size} messages`))
  .catch(console.error);
		
});

bot.on('messageReactionRemove', (messageReaction, user) => {
	
	var embed = new Discord.RichEmbed()
	.setColor("#AA0000")
	.setTimestamp()
	.setDescription(`Username: **${user.username}** | ${user.tag}`);
	
	if(messageReaction.emoji.id === null){
		embed.setAuthor(messageReaction.emoji + "Reaction removed in #" + messageReaction.message.channel.name);
	}else{
		embed.setAuthor(`Reaction removed in #${messageReaction.message.channel.name}`, "https://cdn.discordapp.com/emojis/" + messageReaction.emoji.id + ".png" );
	}
						
	sendMessage(bellpost, {embed});

});

bot.on('message', message => {
	
	if(message.channel.type == "dm"){
		if (message.author.id === config.ujinbotID){
			checkUjinMessage(message);
		}
	}

	if(message.content.startsWith("]lang ")){
		var newLang = message.content.slice(6);
		message.author.langCode = newLang;
	}
	
	if(message.channel === botpost && !message.author.bot){
		
		tts.spamTTS(message);

		
	}
	
	if(message.channel === chanGeneral && !message.author.bot){
		tts.generalTTS(message);
		
	}
	
	if (message.channel == botpost || message.channel == trashpost){
	}else return;
		
	if(message.content.startsWith(']')){
	   try{
			if(message.member.roles.has('317763990270902274')){
				sendMessage(message.channel, "You are command muted. Do not bot pretzels or mushrooms boyo.");
				return; //command mute role
			}
		}
		catch(err) {
			console.log(err);
		}
	}
	
	if (message.content == ']test') {
		sendMessage(message.channel, 'toast');
	}
	
	if(message.content == ']help') {
		sendMessage(message.channel, "Here's my documentation, officer. <https://github.com/meeseekms/Kinoko-discord-bot/blob/master/README.txt>");
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
	
	if(message.content.startsWith(']mushies') || message.content.startsWith(']m')){
		
		var balance = bank.getBalanceUser(message.author);
		
		if(message.mentions.users.first()){
			balance = bank.getBalanceUser(message.mentions.users.first());
			sendMessage(message.channel, message.mentions.users.first().username + " has " + balance.toLocaleString() + config.currency);
			return;
		}
		
		sendMessage(message.channel, "You have " + balance.toLocaleString() + config.currency);
	}
	
	if(message.content.startsWith(']send ')){
		sendMushies(message);
	}
	
	if(message.content.startsWith(']work') || message.content == ']w'){
		sendMessage(message.channel, work.mushiesWork(message.author));
	}
	
	if(message.content.startsWith(']top')){
		topWorkers(message);
	}
	
	if(message.content.startsWith(']laziest')){
		leastWorked(message);
	}

	if(message.content.startsWith(']greediest')){
		greediest(message);
	}

	if(message.content.startsWith(']poorest')){
		poorest(message);
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
		sendMessage(message.channel, work.harvest(message.author, choice));
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
	
	if(message.content.startsWith(']setgame ')){
	   	var str = message.content.slice(9);
		bot.user.setPresence({ game: { name: str, type: 0 } });
		console.log("\nsetting game: " + str);
	}
	
	if(message.content === "]pretzels" || message.content === "]p"){
		sendMessage(message.channel, "You have " + bank.getItemBalanceUser(message.author, "Ujin Currency") + config.ujinCurrency);
	}
	
	if(message.content.startsWith(']withdraw ')){
	   withdrawPretzels(message);
	}
	
	if(message.content == ']sellp' || message.content == ']buyp'){
		sendMessage(message.channel, "Hi! The command to buy or sell pretzels on the exchange is ]buyp <quantity> <price> or ]sellp <quantity> <price>. To see related commands do ]help");
	}
	
	if(message.content.startsWith(']sellp ')){
		sellPretzels(message);
	}
	
	if(message.content.startsWith(']buyp ')){
		buyPretzels(message);
	}
	
	if(message.content === "]sellorders"){
		sendMessage(message.channel, exchange.getSellOrders(0, 50));
	}
	
	if(message.content === "]buyorders"){
		sendMessage(message.channel, exchange.getBuyOrders(0, 50));
	}
	
	if(message.content.startsWith("]history ")){
	   
	   	var array = message.content.split(' ');
		if(array.length > 2) return;
	
		if(array.length == 2){
			var choice = parseInt(array[1]);
			if(choice >= 0){
				sendMessage(message.channel, exchange.getHistory(choice));
			}
		}
	}
	
	if(message.content == "]history"){
		sendMessage(message.channel, exchange.getHistory(5));
	}
	
	if(message.content == "]removesells"){
		exchange.removeAllSellOrdersUser(message.author);
		sendMessage(message.channel, "If you had any open sell orders, they've been just been revoked!");
	}
	
	if(message.content == "]removebuys"){
		exchange.removeAllBuyOrdersUser(message.author);
		sendMessage(message.channel, "If you had any open buy orders, they've just been revoked!");
	}
	
	if(message.content === "]joinVC"){
		tts.joinVC(message);
		
	}
	
	if(message.content === "]quitVC"){
		tts.quitVC(message);
	}
	
	if(message.content.startsWith("]userTTS")){
		tts.toggleUserTTS(message);
	}
	
	if(message.content.startsWith("]generalTTS")){
		tts.toggleGenTTS(message);
	}
	
	if(message.content.startsWith("]spamTTS")){
		tts.toggleSpamTTS(message);
	}

	if(message.content.startsWith("]tts ")){
		tts.userTTS(message);
	}
	
	if(message.content.startsWith("]ttss ")){
	   tts.userTTSSpeed(message);
	}
	
	if(message.content === "]mylang"){
		if(!message.author.hasOwnProperty('langCode')){
			message.author.langCode = 'en';
		}
		message.reply("Your current lang is: " + message.author.langCode);
	}
	
	if(message.content.startsWith("]dec ")){
		tts.decTTS(message);
	}
	
	if(message.content.startsWith("]echo ")){
	   tts.echoTTS(message);
	}
	
	if(message.content.startsWith("c]bet")){
		var args = message.content.split(' ');
		if(args.length < 2) return;
		
		var bet = Math.round(parseInt(args[1]));
		if(bet <= 0) return;
		cgame.makeBet(message.author, bet);
	}
	
	if(message.content == "c]roll"){
		cgame.makeRoll(message.author);
	}
	
	if(message.content == "c]stats"){
		cgame.getStats();
	}
	
	if(message.content.startsWith("pc]bet")){
		var args = message.content.split(' ');
		if(args.length < 2) return;
		
		var bet = Math.round(parseInt(args[1]));
		if(bet <= 0) return;
		pcgame.makeBet(message.author, bet);
	}
	
	if(message.content == "pc]roll"){
		pcgame.makeRoll(message.author);
	}
	
	if(message.content == "pc]stats"){
		pcgame.getStats();
	}
	
	if(message.content == "]timely"){
		sendMessage(message.channel, ".timely");
	}
	
	if(message.content.startsWith("]interest")){
		bank.claimPretzelInterest(message);
	}
	
	if(message.content.startsWith("]totalInt")){
	   bank.getTotalInterest(message);
	}
	
	if(message.content.startsWith(']flipStats')){
		var stats = flip.getFlipStats();
		sendMessage(message.channel, "Kinoko has hosted " + stats.flips + " flips, and made a profit of " + stats.profit.toLocaleString() + config.currency + " from bet flips. Income: " +  stats.income.toLocaleString() + " Payout: " + stats.payout.toLocaleString());
	}
	
	if(message.content == ']avatar'){
		avatar.getAvatar(message);

	}
	
	if(message.content.startsWith(']spin ')){
		spin.spinChoose(message);
		console.log(bot.user.avatarURL);
	}

	if(message.content.startsWith(']bs ')){
		spin.betSpin(message);
	}

	if(message.content.startsWith(']mspinstats')){
		sendMessage(message.channel, spin.mSpinStats());
	}

	if(message.content.startsWith(']pspinstats')){
		sendMessage(message.channel, spin.pSpinStats());
	}

	if(message.content.startsWith(']sinavatar')){
		avatar.sin(message);
	}

	if(message.content.startsWith(']tunnel')){
		avatar.tunnelAvatar(message);
	}

	if(message.content.startsWith(']AAA') || message.content.startsWith(']aaa')){
		avatar.AAA(message);
	}
});

function sendMessage(channel, message){
		console.log("LOGGING chANneL: " + channel + "\n Message: " + message);
		channel.send(message);
}


function sendMushies(message){
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
	if(amount <= 0 || amount > 1000000) return;

	if(bank.sendMushies(fromUser, toUser, amount)){
		sendMessage(message.channel, fromUser.username + " sent " + amount + config.currency + " to " + toUser.username);
	}
}

function topWorkers(message){
	var args = message.content.split(' ');
	var amount = 5;
	if(args.length == 2){
		amount = parseInt(args[1]);
		if(!amount){
			amount = 5;
		}
	}
	var array = work.topWorkers(amount);
	var namesText = "";

	for(i = 0; i<array.length; i++){
		namesText = namesText + '\n' + (i+1) + ') ' + array[i].name + "  --- " + array[i].totalWorked + config.currency;
	}
	
	sendMessage(message.channel, "Here are what the best workers have earned for the kingdom. Aspire to be like them!" + namesText);
}

function leastWorked(message){
	var args = message.content.split(' ');
	var amount = 5;
	if(args.length == 2){
		amount = parseInt(args[1]);
		if(!amount){
			amount = 5;
		}
	}
	var array = work.laziestWorkers(amount);
	var namesText = "";

	for(i = 0; i < array.length; i++){
		namesText = namesText + '\n' + (i+1) + ') ' + array[i].name + "  --- " + array[i].totalWorked + config.currency;
	}
	sendMessage(message.channel, "Here are the laziest workers. *Encourage* them to work harder!" + namesText);
}

function greediest(message){
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
		namesText = namesText + '\n' + (i+1) + ') ' + array[i].name + "  --- " + array[i].balance.toLocaleString() + config.currency;
	}		
	sendMessage(message.channel, "Here are the richest workers. Tell them to share!" + namesText);
}

function poorest(message){
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
		namesText = namesText + '\n' + (i+1) + ') ' + array[i].name + "  --- " + array[i].balance.toLocaleString() + config.currency;
	}		
	sendMessage(message.channel, "Here are the poorest workers. Share with your comrades!" + namesText);
}

function checkUjinMessage(message){
	
	if(message.embeds.length){
		var embed = message.embeds[0];
	}else return;
	console.log("title: " + message.embeds[0].title);
	console.log("field 1 name: " + message.embeds[0].fields[1].name);
	console.log("field 1 value: " + message.embeds[0].fields[1].value);

	if(embed.title.startsWith("Received")){
		parseUjinString(embed);
	}
	
}

function parseUjinString(embed){
	var fromUser = parseUjinFrom(embed.fields[1].value);
	var amount = parseUjinAmount(embed);
		
	if(amount > 0){
		amount = Math.floor(amount);
		bank.addItemUser(fromUser, "Ujin Currency", amount);
		sendMessage(botpost, "Thanks! You deposited " + amount + config.ujinCurrency);
	}
	console.log("\nThe from user: " + fromUser.username);
	
}

function parseUjinFrom(str){
	var index = str.indexOf(") - .");
	var endIndex = index - 18;
	var result = str.substr( endIndex, 18);
	console.log("endIndex: " + endIndex);
	console.log("ujin from id: " + result);
	return bot.users.get(result);
}

function parseUjinAmount(embed){
		
	if(embed.fields[0].name == "Amount"){
		var result = embed.fields[0].value;
	}
	console.log("amount: " + result);
	return parseInt(result);
}

function withdrawPretzels(message){
	var amountStr = message.content.slice(10);
	var amount = Math.floor(parseInt(amountStr));
	
	if(bank.subtractItemUser(message.author, "Ujin Currency", amount)){
		sendMessage(message.channel, ".give " + amount + " " + message.author);
	}
}

function sellPretzels(message){
	var args = message.content.split(' ');
	
	if(args.length != 3) return;
	
	var quantity = parseInt(args[1]);
	var price = parseInt(args[2]);
	
	if(exchange.createSellOrder(message.author, "Ujin Currency", quantity, price)){
		sendMessage(message.channel, "order placed!");
	}else{
		sendMessage(message.channel, "Something isn't right...");
	}
}

function buyPretzels(message){
	var args = message.content.split(' ');
	
	if(args.length != 3) return;
	
	var quantity = parseInt(args[1]);
	var price = parseInt(args[2]);
	
	if(exchange.createBuyOrder(message.author, "Ujin Currency", quantity, price)){
		sendMessage(message.channel, "order placed!");
	}else{
		sendMessage(message.channel, "Something isn't right...");
	}
}




function update(){
	var message = waifu.updateAll();
	if(message){
		sendMessage(botpost, message);
	}
	setTimeout(update, 60000);
}
//setTimeout(update, 60000);

bot.login(config.token);

exchange.bot = bot;