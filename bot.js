const Discord = require('discord.js');

var config = require('./json/config.json');
var bank = require('./js/bank.js');
var kms = require('./js/suicide.js');
var flip = require('./js/flip.js');
var work = require('./js/work.js');
var save = require('./js/save.js');
var bomb = require('./js/bomb.js');
var balloon = require('./js/balloon.js');
var exchange = require('./js/exchange.js');
var ceelo = require('./js/ceelo.js');
var avatar = require('./js/avatar.js');
var spin = require('./js/spin.js');
var page = require('./js/page.js');
var swear = require('./json/swears.json');
var swears = swear.swears;

var bot2 = require('./bot2.js');
bot2.bank = bank;

var botpost;
var bellpost;
var chanGeneral;
var trashpost;
var botprivate;
var chanMedia;

var cgame;
var pcgame;


const bot = new Discord.Client();

class LibtardFee {
	constructor(bot, bank){
		this.bot = bot;
		this.bank = bank;
	}

	save(){
		this.conf.members = [...this.members];
		save.jsonSave(this.conf, `libtard.json`);
	}

	makeNewConf() {
		console.log("making new libtard");
		this.members = new Map();
		this.conf = {
			total: 0,
			members: []
		}
		this.save();
	}

	checkForConfig() {
		let file = `./json/libtard.json`;
		console.log("file: " + file);
		if(save.exists(file)){
			try{
				this.conf = require(file);
				this.members = new Map(this.conf.members);
			}catch (err){
				this.makeNewConf();
				return;
			}
			return;
		}else{
			this.makeNewConf();
			return;
		}
	}

	init(){
		this.checkForConfig();
	}

	get total(){
		return this.conf.total;
	}

	sendLeaderBoardPage(message){
		let array = [];
		let members = [...this.members.values()];

		function compare(a, b){
			var a1 = a.amount;
			var b1 = b.amount;
			return b1 - a1;
		}

		members.sort(compare);
		members.forEach( (m, i) => {
			console.log(m.username);
			let str = (i + 1).toString() + ") " + m.username + " **" + m.amount.toLocaleString() + "**:mushroom:";
			array.push(str);
			//console.log(r.members.size);
		})

		var pg = new page.Page(this.bot, "Libtard Fee Leaderboard", array, 10);
		//console.log(array);
		pg.send(message.channel);
	}

	payFee(message){
		let amount = Math.round(parseInt(message.content.split(' ')[1]));
		if(isNaN(amount) || amount <= 0) return;

		if(this.bank.subtractBalanceUser(message.author, amount)){
			this.conf.total += amount;
			this.addFee(message.author, amount);
			message.reply(" Thanks for paying " + amount + ":mushroom: towards your libtard fee!")
		}
	}

	addFee(user, amount){
		if(this.members.has(user.id)){
			this.members.get(user.id).amount += amount;
		}else{
			this.addMember(user);
			this.members.get(user.id).amount = amount;
		}
		this.save();
	}

	addMember(user){
		let obj = {
			username: user.username,
			amount: 0,
			userID: user.id
		}
		this.members.set(user.id, obj);
	}

	userAmount(user){
		if(this.members.has(user.id)){
			return this.members.get(user.id).amount;
		}else return 0;
	}
}

let libtard;

bot.on('ready', () => {
	console.log('I am ready!');

	botpost = bot.channels.get('487288080764502016');
	bellpost = bot.channels.get('487290646227451915');
	chanGeneral = bot.channels.get('487284236760383498');
	trashpost = botpost;//bot.channels.get('197198331817099266');
	botprivate = bot.channels.get('487290631308312578');
	modlogs = bot.channels.get('487289361151295498');
	hallchan = bot.channels.get('487289584624074773');
	modchat = bot.channels.get('487286124390383626');
	
	cgame = new ceelo.Ceelo(botpost, {name: "mushrooms", emoji: ":mushroom:"}, 5);
	pcgame = new ceelo.Ceelo(botpost, {name: "Ujin Currency", emoji: "<:pretzel:363385221976162304>"}, 5);	
	chanGeneral.fetchMessages({ limit: 15 })
  .then(messages => console.log(`Received ${messages.size} messages`))
  .catch(console.error);
	
	chanMedia = bot.channels.get('451819303407321088');

	libtard = new LibtardFee(bot, bank);
	libtard.init();

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
		return;
	}

	if(message.content.startsWith("]lang ")){
		var newLang = message.content.slice(6);
		message.author.langCode = newLang;
		return;
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
		return;
	}
	
	if(message.content == ']help') {
		sendMessage(message.channel, "Here's my documentation, officer. <https://github.com/meeseekms/Kinoko-discord-bot/blob/master/README.txt>");
		
	}
	
	if(message.content.startsWith(']addMethod ')) {
		sendMessage(message.channel, kms.add(message, "method"));
		return;
	}
	
	if(message.content.startsWith(']addSuccess ')){
		sendMessage(message.channel, kms.add(message, "success"));
		return;
	}
	
	if(message.content.startsWith(']addFail ')){
		sendMessage(message.channel, kms.add(message, "fail"));
		return;
	}
	
	if (message.content.startsWith(']kms')) {
		sendMessage(message.channel, kms.attemptSuicide(message.author));
		return;
	}
	
	if(message.content.startsWith(']mushies') || message.content.startsWith(']m ') || message.content == ']m'){
		
		var balance = bank.getBalanceUser(message.author);
		
		if(message.mentions.users.first()){
			balance = bank.getBalanceUser(message.mentions.users.first());
			sendMessage(message.channel, message.mentions.users.first().username + " has " + balance.toLocaleString() + config.currency);
			return;
		}
		
		sendMessage(message.channel, "You have " + balance.toLocaleString() + config.currency);
		return;
	}
	
	if(message.content.startsWith(']send ')){
		sendMushies(message);
		return;
	}
	
	if(message.content.startsWith(']work') || message.content == ']w'){
		sendMessage(message.channel, work.mushiesWork(message.author));
		return;
	}
	
	if(message.content.startsWith(']top')){
		topWorkers(message);
		return;
	}
	
	if(message.content.startsWith(']laziest')){
		leastWorked(message);
		return;
	}

	if(message.content.startsWith(']greediest')){
		greediest(message);
		return;
	}

	if(message.content.startsWith(']poorest')){
		poorest(message);
		return;
	}
		
	if(message.content.startsWith(']totalWorked')){
		sendMessage(message.channel, message.author.username + " has earned a total of " + bank.getTotalWorkedUser(message.author) + config.currency + " for their kingdom. Good job, comrade.");
		return;
	}
	
	if(message.content.startsWith(']bf ALL ')){
		sendMessage(message.channel, flip.betFlipAll(message, bank));
		return;
	}
	
	if(message.content.startsWith(']bf ')){
		sendMessage(message.channel, flip.betFlip(message, bank));
		return;
	}
	
	
	if(message.content.startsWith(']population')){
		sendMessage(message.channel, "The " + config.currency + " kingdom has " + bank.getPopulation() + " members! Go tell everyone you know to do `]mushies` to increase the population!");
		return;
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
		return;
	}
	
	if(message.content == ']bomb'){
		sendMessage(message.channel, bomb.printBomb());
		return;
	}
	if(message.content == ']balloon'){
		sendMessage(message.channel, balloon.printBalloon(bank));
		return;
	}
	if(message.content == ']buyballoon'){
		sendMessage(message.channel, balloon.buyBalloon(bank, message.channel, message.author));
		return;
	}
	if(message.content == ']buybomb'){
		sendMessage(message.channel, bomb.buyBomb(bank, message.author));
		return;
	}
	
	if(message.content.startsWith(']setgame ')){
	   	var str = message.content.slice(9);
		bot.user.setPresence({ game: { name: str, type: 0 } });
		console.log("\nsetting game: " + str);
		return;
	}

	if(message.content.startsWith(']setstream ')){
		var str = message.content.slice(11);
		bot.user.setPresence({game: {name: str, type: 1} });
		console.log("setting stream: " + str);
		return;
	}

	if(message.content.startsWith(']setlisten ')){
		var str = message.content.slice(11);
		bot.user.setPresence({game: {name: str, type: 2} });
		console.log("setting listen: " + str);
		return;
	}

	if(message.content.startsWith(']setwatch ')){
		var str = message.content.slice(10);
		bot.user.setPresence({game: {name: str, type: 3} });
		console.log("setting watch: " + str);
		return;
	}
	
	if(message.content === "]pretzels" || message.content === "]p"){
		sendMessage(message.channel, "You have " + bank.getItemBalanceUser(message.author, "Ujin Currency") + config.ujinCurrency);
		return;
	}
	
	if(message.content.startsWith(']withdraw ')){
	   withdrawPretzels(message);
	   return;
	}
	
	if(message.content == ']sellp' || message.content == ']buyp'){
		sendMessage(message.channel, "Hi! The command to buy or sell pretzels on the exchange is ]buyp <quantity> <price> or ]sellp <quantity> <price>. To see related commands do ]help");
		return;
	}
	
	if(message.content.startsWith(']sellp ')){
		sellPretzels(message);
		return;
	}
	
	if(message.content.startsWith(']buyp ')){
		buyPretzels(message);
		return;
	}
	
	if(message.content === "]sellorders"){
		sendMessage(message.channel, exchange.getSellOrders(0, 50));
		return;
	}
	
	if(message.content === "]buyorders"){
		sendMessage(message.channel, exchange.getBuyOrders(0, 50));
		return;
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
		return;
	}
	
	if(message.content == "]history"){
		sendMessage(message.channel, exchange.getHistory(5));
		return;
	}
	
	if(message.content == "]removesells"){
		exchange.removeAllSellOrdersUser(message.author);
		sendMessage(message.channel, "If you had any open sell orders, they've been just been revoked!");
		return;
	}
	
	if(message.content == "]removebuys"){
		exchange.removeAllBuyOrdersUser(message.author);
		sendMessage(message.channel, "If you had any open buy orders, they've just been revoked!");
		return;
	}
	
	
	
	if(message.content.startsWith("c]bet")){
		var args = message.content.split(' ');
		if(args.length < 2) return;
		
		var bet = Math.round(parseInt(args[1]));
		if(bet <= 0) return;
		cgame.makeBet(message.author, bet);
		return;
	}
	
	if(message.content == "c]roll"){
		cgame.makeRoll(message.author);
		return;
	}
	
	if(message.content == "c]stats"){
		cgame.getStats();
		return;
	}
	
	if(message.content.startsWith("pc]bet")){
		var args = message.content.split(' ');
		if(args.length < 2) return;
		
		var bet = Math.round(parseInt(args[1]));
		if(bet <= 0) return;
		pcgame.makeBet(message.author, bet);
		return;
	}
	
	if(message.content == "pc]roll"){
		pcgame.makeRoll(message.author);
		return;
	}
	
	if(message.content == "pc]stats"){
		pcgame.getStats();
		return;
	}
	
	if(message.content.startsWith("]interest")){
		bank.claimPretzelInterest(message);
		return;
	}
	
	if(message.content.startsWith("]totalInt")){
	   bank.getTotalInterest(message);
	   return;
	}
	
	if(message.content.startsWith(']flipStats')){
		var stats = flip.getFlipStats();
		sendMessage(message.channel, "Kinoko has hosted " + stats.flips + " flips, and made a profit of " + stats.profit.toLocaleString() + config.currency + " from bet flips. Income: " +  stats.income.toLocaleString() + " Payout: " + stats.payout.toLocaleString());
		return;
	}
	
	if(message.content == ']avatar'){
		avatar.getAvatar(message);
		return;
	}
	
	if(message.content.startsWith(']spin ')){
		spin.spinChoose(message);
		return;
	}

	if(message.content.startsWith(']bs ')){
		spin.betSpin(message);
		return;
	}

	if(message.content.startsWith(']mspinstats')){
		sendMessage(message.channel, spin.mSpinStats());
		return;
	}

	if(message.content.startsWith(']pspinstats')){
		sendMessage(message.channel, spin.pSpinStats());
	}

	if(message.content.startsWith(']sinavatar')){
		avatar.sin(message);
		return;
	}

	if(message.content.startsWith(']tunnel')){
		avatar.tunnelAvatar(message);
		return;
	}

	if(message.content.startsWith(']AAA') || message.content.startsWith(']aaa')){
		avatar.AAA(message);
		return;
	}

	if(message.content.startsWith(']circulation')){
		sendMessage(message.channel, "Users have " + bank.pretzelCirculation() + config.ujinCurrency + ' stored in the Bank of Kinoko');
		return;
	}

	if(message.content.startsWith(']slide ')){
		avatar.slideText(message);
		return;
	}

	if(message.content.startsWith(']wave ')){
		avatar.waveText(message);
		return;
	}  
	if(message.content.startsWith(']saypercent ')){
		var string = message.content.slice(12);
		message.guild.search({
			content: string
		}).then(res => {
   			var totalTimes = res.totalResults;
   			message.guild.search({
   				content: string,
   				author: message.author
   			}).then(res2 => {
   					var userTimes = res2.totalResults;
   					var percentage = userTimes / totalTimes * 100;
   					message.reply("You've said `" + string + "` **" + userTimes + " times**! It's been said a total of **" + totalTimes + " times**. That's **" + percentage + "%** of the time!");
   				})
		}).catch(console.error);
	}
	//]event 5;Movie Night;Dank Movie about vampires;link
	if(message.content == ']event'){
		message.reply("]event minutes-from-now;title;description;link");
	}

	if(message.content.startsWith(']event ')){
		var string = message.content.slice(7);
		var args = string.split(';');
		var minutes = parseInt(args[0]);
		var title = args[1];
		var desc = args[2];
		var link = args[3];
		var d = new Date();
		var startDate = new Date(d.getTime() + (minutes * 60000));
		var e = {
			author: message.author.username,
			minutes: minutes,
			startDate: startDate,
			title: title,
			desc: desc,
			link: link
		}

		var embed = new Discord.RichEmbed()
		.setColor("#AA0000")
		.setTimestamp(startDate)
		.setFooter("Event starts at ")
		.setAuthor(message.author.username)
		.setTitle(title)
		.addField("**When**:", minutes + " minutes from now.")
		.addField("**Join us**:", link)
		.setDescription(desc);

		chanMedia.send(embed)
		.then(msg => {
			e.message = msg;
			setTimeout(updateEvent, 60000, e);
		});
	}

	if(message.content == ']libtardfee'){
		message.channel.send(libtard.total.toLocaleString() + ":mushroom: has been paid toward the libtard fee by the server.");
		return;
	}

	if(message.content == ']libtardme'){
		message.reply(" You have contributed " + libtard.userAmount(message.author).toLocaleString() + ":mushroom: to the libtard fee.");
		return;
	}

	if(message.content.startsWith(']paylibtardfee ')){
		libtard.payFee(message);
		return;
	}

	if(message.content.startsWith(']libtardboard')){
		libtard.sendLeaderBoardPage(message);
		return;
	}

});

function updateEvent(event){
	event.minutes -= 1;
	var embed = new Discord.RichEmbed()
	.setColor("#AA0000")
	.setTimestamp(event.startDate)
	.setAuthor(event.author)
	.setTitle(event.title)
	.addField("**Join us**:", event.link)
	.setDescription(event.desc);

	if(event.minutes <= 0){
		embed.addField("**When**:", "Already started.");
		embed.setFooter("Event started at ");
		event.message.edit(embed)
		.catch(console.error);
		return;

	}else{
		embed.addField("**When**:", event.minutes + " minutes from now.");
		embed.setFooter("Event starts at ");
		event.message.edit(embed)
		.then(setTimeout(updateEvent, 60000, event))
		.catch(console.error);
		
	}
}

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
bot.login(config.token);

exchange.bot = bot;