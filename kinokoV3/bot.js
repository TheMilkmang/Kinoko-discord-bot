const Discord = require('discord.js');
var googleTTS = require('google-tts-api');
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


var botpost;
var bellpost;
var chanGeneral;
var VC = false;
var langCode = 'en';
var vcMessages = [];
var canSpeak = true;
var userTTS = false;
var generalTTS = false;
var spamTTS = false;
var unusedLangs = config.goodLangs.slice();
const bot = new Discord.Client();

bot.on('ready', () => {
	console.log('I am ready!');
	
	botpost = bot.channels.get(config.botPostID);
	bellpost = bot.channels.get(config.bellPostID);
	chanGeneral = bot.channels.get(config.generalID);
	
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
	
	if(message.channel === botpost && VC && spamTTS && !message.author.bot){
		
		var cleanMessage = ttsCleanMessage(message.content);
		console.log(cleanMessage);
		if(cleanMessage.length > 200 || cleanMessage.length == 0)return;
		
		if(!message.author.hasOwnProperty('langCode')){
			
			message.author.langCode = config.langs[ Math.floor(Math.random() * config.langs.length) ];
		}
		
		var ttsObj = { message: cleanMessage, lang: message.author.langCode, speed: 1 };
		
		console.log("doing gen voice on message: " + ttsObj.message + "\n Lang code: " + ttsObj.lang);
		
		vcMessages.push(ttsObj);
		playTTS();
		
	}
	
	if(message.channel === chanGeneral && VC && generalTTS && !message.author.bot){
		console.log("message in general");
		var cleanMessage = ttsCleanMessage(message.content);
		console.log(cleanMessage);
		if(cleanMessage.length > 200 || cleanMessage.length == 0)return;
		
		if(!message.author.hasOwnProperty('langCode')){
			if(unusedLangs.length){
				var codeIndex = Math.floor(Math.random() * unusedLangs.length);
				message.author.langCode = config.goodLangs[codeIndex];
				unusedLangs.splice(codeIndex, 1);
			}else{
				message.author.langCode = config.langs[Math.floor(Math.random() * config.langs.length)];
			}
		}
		
		var ttsObj = { message: cleanMessage, lang: message.author.langCode, speed: 1 };
		
		console.log("doing gen voice on message: " + ttsObj.message + "\n Lang code: " + ttsObj.lang);
		
		vcMessages.push(ttsObj);
		playTTS();
		
	}
	
	if (message.channel != botpost) return;
	
	
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
			sendMessage(message.channel, message.mentions.users.first().username + " has " + balance + config.currency);
			return;
		}
		
		sendMessage(message.channel, "You have " + balance + config.currency);
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
		if(VC !== false){
			sendMessage(message.channel, "I think I'm already in a VC channel...");
		}
		
		if (message.member.voiceChannel) {
			
      		message.member.voiceChannel.join()
        	.then(connection => { // Connection is an instance of VoiceConnection
          		VC = connection;
				message.reply('I have successfully connected to the channel!');
				connection.on('disconnect', () => { VC = false; } );	
		})
        .catch(console.log);
    	} else {
     		 message.reply('You need to join a voice channel first!');
    	}
		
	}
	
	if(message.content === "]quitVC"){
		if(VC !== false){
			VC.disconnect();
		}
	}
	
	if(message.content.startsWith("]userTTS")){
		if(!userTTS){
			userTTS = true;
			generalTTS = false;
			spamTTS = false
			sendMessage(message.channel, "User TTS enabled. General TTS disabled. Type ]tts <message> to speak!");
		}else{
			userTTS = false;
			sendMessage(message.channel, "User TTS disabled.");
		}
	}
	
	if(message.content.startsWith("]generalTTS") && message.author.id === '282340868705222667'){
		if(!generalTTS){
			generalTTS = true;
			userTTS = false;
			spamTTS = false
			sendMessage(message.channel, "General TTS enabled. User TTS disabled. Listen to them talk xd");
		}else{
			generalTTS = false;
			sendMessage(message.channel, "General TTS disabled. Wasn't it amusing though?");
		}
	}
	
	if(message.content.startsWith("]spamTTS")){
		if(!spamTTS){
			spamTTS = true;
			userTTS = false;
			generalTTS = false
			sendMessage(message.channel, "Spam TTS enabled. User TTS disabled. Listen to them talk xd");
		}else{
			spamTTS = false;
			sendMessage(message.channel, "Spam TTS disabled. Wasn't it amusing though?");
		}
	}

	if(message.content.startsWith("]tts") && userTTS){
		var ttsMsg = message.content.slice(5);
		var lang = 'en';
		
		var cleanMessage = ttsCleanMessage(ttsMsg);

		
		if(message.author.hasOwnProperty('langCode')){
			lang = message.author.langCode;
		}
		
		var ttsObj = { message: cleanMessage, lang: lang, speed: 1 };

		if(cleanMessage.length > 200 || cleanMessage.length == 0){
			sendMessage(message.channel, "TTS messages need to be less than 200 characters. Yours was " + ttsMsg.length + " characters.");
			return;
		}
		
		vcMessages.push(ttsObj);
		playTTS();		
	}
	
	if(message.content === "]mylang"){
		if(!message.author.hasOwnProperty('langCode')){
			message.author.langCode = 'en';
		}
		sendMessage(message.channel, "Your current lang is: " + message.author.langCode);
	}
	
	if(message.content.startsWith("]dec ") && userTTS){
		var ttsMsg = message.content.slice(5);
		
		if(!VC.speaking){
			var url = "http://talk.moustacheminer.com/api/gen?dectalk=";
			url += encodeURIComponent(ttsMsg.trim());
			console.log("dec url: " + url);
			const dispatcher = VC.playArbitraryInput(url);
		}
	}
	
	if(message.content.startsWith("]gl ")){
		var code = message.content.slice(4);
		config.goodLangs.push(code);
		save.jsonSave(config, 'config.json');
		sendMessage(message.channel, "Added " + code + " to the list of good langs.");
	}
	
});

function sendMessage(channel, message){
		console.log("LOGGING chANneL: " + channel + "\n Message: " + message);
		channel.send(message);
}

function playTTS(){
	
	
	if(!VC.speaking && canSpeak){	
		canSpeak = false;
		googleTTS(vcMessages[0].message, vcMessages[0].lang, vcMessages[0].speed)
		.then( url => { 
			const dispatcher = VC.playArbitraryInput(url); 

			dispatcher.on('start', () => {
				VC.player.streamingData.pausedTime = 0;				
			});

			dispatcher.on('end', () => {
				canSpeak = true;
				vcMessages.shift();
				console.log("on end length " + vcMessages.length);
				if(vcMessages.length > 0){
					console.log("playing vc on end");
					playTTS();
				}
			})

		})
		.catch( e => { 
			console.log(e); 
			canSpeak = true;
		});
	}
}

function ttsCleanMessage(str){
	if( str.indexOf('<') >= 0){
	   var left = str.indexOf('<');
		console.log("index of left: " + left);
	}else{
		console.log("returning " + str);
		return(str);
	}

	if( str.indexOf('>', left) >= 0 ){
		var right = str.indexOf('>', left) + 1;
		console.log("index of right: " + right);
	}else return(str);

	var res = str.substring(left, right);
	str = str.replace(res, "");
	console.log("str: " + str);
	return(ttsCleanMessage(str));
		
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
	if(amount >= 0){}else return;

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
		namesText = namesText + '\n' + (i+1) + ') ' + array[i].name + "  --- " + array[i].balance + config.currency;
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
		namesText = namesText + '\n' + (i+1) + ') ' + array[i].name + "  --- " + array[i].balance + config.currency;
	}		
	sendMessage(message.channel, "Here are the poorest workers. Share with your comrades!" + namesText);
}

function checkUjinMessage(message){
	if(message.embeds.length){
		var description = message.embeds[0].description;
	}else return;
	if(description === undefined)return;
	console.log("checking ujin message: " + description);
	
	if(description.startsWith("`You received:`")){
		parseUjinString(description);
	}
}

function parseUjinString(description){
	var fromUser = parseUjinFrom(description);
	var amount = parseUjinAmount(description);
		
	if(amount > 0){
		amount = Math.floor(amount);
		bank.addItemUser(fromUser, "Ujin Currency", amount);
		sendMessage(botpost, "Thanks! You deposited " + amount + config.ujinCurrency);
	}
	console.log("\nThe from user: " + fromUser.username);
	
}

function parseUjinFrom(description){
	var startIndex = description.indexOf(">");
	var newString = description.slice(startIndex);
	var result = newString.match(/(?:^|\D)(\d{18})(?=\D|$)/g)[0].slice(1);
	console.log("\n ujin from: " + result);
	return bot.users.get(result);
}

function parseUjinAmount(description){
	var newString = description.slice(16, 26);
	var numEndIndex = newString.indexOf("<");
	var result = newString.substr(0, numEndIndex);
	
	console.log("\n amount: " + result);
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


function getTimely(){
	sendMessage(botpost, ".timely");
	setTimeout(getTimely, 9660000);
}

function update(){
	var message = waifu.updateAll();
	if(message){
		sendMessage(botpost, message);
	}
	setTimeout(update, 60000);
}
//setTimeout(update, 60000);
setTimeout(getTimely, 9666666);

bot.login(config.token);

exchange.bot = bot;