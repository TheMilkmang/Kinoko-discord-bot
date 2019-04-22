const Discord = require('discord.js');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');


var config = require('./json/config.json');
var save = require('./js/save.js');
var votekick = require('./js/votekick.js');
var starboard = require('./js/starboard.js');
var page = require('./js/page.js');
var Rentarole = require('./js/rentarole.js');
var Markov = require('./js/markov.js');
var tts = require('./js/tts.js');
var inspiroMindfulness = require('./js/inspiromindful.js');
var Plague = require('./js/plague.js');
//var Bridge = require('./js/bridge.js');
var swear = require('./json/swears.json');
var app = express();
const port = 3000;

var botpost;
var bellpost;
var chanGeneral;
var trashpost;
var botprivate;
var modlogs;
var modchat;
var hallchan;
var sb;
var guild;
var rentarole;
var bridge;
var inspiroMindful;
var plague;

exports.bank;
const bot = new Discord.Client();
const hook = new Discord.WebhookClient('487433268325777428', config.cornHook)
const botspamHook = new Discord.WebhookClient('546125155731243020', config.spamHook);
var filter = false;

var kinURL = 'https://cdn.discordapp.com/avatars/401684543326781440/84ec659dcd53cdcd68baf6c8f5210058.png'

let inviteAuth = config.inviteAuth;

var initialInvites = new Map();
let markov = new Markov();
markov.init();

let postQueue = [];


setInterval(function(){
	markov.save();
	console.log("saved markov");
}, 60000);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', function(req, res){
    //res.send('your name is '+req.body.name);
    //res.status(200).json({data:req.body});
    console.log("body: " + JSON.stringify(req.body));
    postQueue.push(req.body);
    honestQueue();
    res.end("received");
});

app.listen(port);


function honestQueue(){
	let first;
	if(!postQueue.length) return;

	first = postQueue.shift();

	honestPOST(first);

	if(postQueue.length){
		setTimeout(function(){
			honestQueue();
		}, 2000);
	}
}


function honestPOST(body){
	let user;

	if(body.hasOwnProperty('name') && body.hasOwnProperty('message')){
		let converted = body.message;
		if(body.name == "Mods"){
			modchat.send("New Sharadow Message: `" + converted + "`")
			.catch(console.error);
			return;
		}
	}

	if(body.hasOwnProperty('name')){
		user = guild.members.find(val => val.user.tag == body.name);

		if(!user){
			console.log("no user honest post");
			return;
		}
	}else return;

	if(body.hasOwnProperty('type')){
		let string;
		let types = ['message', 'reveal', 'request'];
		let messages = [' You have a new message on 2honest42meirl! https://2honest42meirl.com/messages',
						' Somebody revealed who they are! https://2honest42meirl.com/messages',
						' You have a new request to reveal your identity! https://2honest42meirl.com/messages'];

		if(types.includes(body.type)){
			string = messages[types.indexOf(body.type)];
		}else{
			console.log("bad type??");
			return;
		}

		user.createDM()
		.then(dm => {
			dm.send(string)
			.then(msg => console.log("sent " + msg.content + " to " + user.user.username) ) 
			.catch(console.error);
		})
		.catch(console.error);
	}else if(body.hasOwnProperty('activation')){

		user.createDM()
		.then(dm => {
			dm.send("Somebody registered your discord tag with 2honest42meirl. Click this link to activate " + body.activation + " If this wasn't you then ignore this message. ")
			.catch(console.error);
		})
		.catch(console.error);
		
	}

}


bot.on('ready', () => {
	console.log('I am ready!');

	guild = bot.guilds.get('177192169516302336');
	botpost = bot.channels.get('487288080764502016');
	bellpost = bot.channels.get('487290646227451915');
	chanGeneral = bot.channels.get('487284236760383498');
	trashpost = botpost;//bot.channels.get('197198331817099266');
	botprivate = bot.channels.get('487290631308312578');
	modlogs = bot.channels.get('487289361151295498');
	hallchan = bot.channels.get('487289584624074773');
	modchat = bot.channels.get('487286124390383626');
	votekick.modlogs = hallchan;
	votekick.Discord = Discord;
	inspiroMindful = new inspiroMindfulness(bot, '177192169516302336');
	plague = new Plague(bot, '177192169516302336');
	sb = new starboard.Starboard(bot, hook, hallchan, 6, "487289584624074773");

	chanGeneral.fetchMessages({ limit: 100 })

	guild.fetchInvites()
	.then(invites => {
		invites.forEach(inv =>{
			initialInvites.set(inv.code, {
				uses: inv.uses,
				inviter: inv.inviter
			});
		});
	})
	.catch(console.error);

	guild.fetchMembers()
	.catch(console.error);

	setInterval(function(){
		guild.fetchInvites()
		.then(invites => {
			invites.forEach(inv =>{
				initialInvites.set(inv.code, {
					uses: inv.uses,
					inviter: inv.inviter
				});
			});
		})
		.catch(console.error);
	}, 300000)

	rentarole = new Rentarole.Rentarole(bot, guild, botpost, exports.bank);
	setInterval(function(){
		rentarole.checkRoles();
	}, 1800000)
		
	//bridge = new Bridge.Bridge(bot, guild);

});

function checkInvited(member){
	guild.fetchInvites()
	.then(invites => {
		invites.forEach(inv => {
			if(!initialInvites.has(inv.code)){
				console.log(inv.code + " not found in local map.");
			}
			if(initialInvites.has(inv.code) && inv.uses > initialInvites.get(inv.code).uses){
				bellpost.send(member.user.tag + " was likely invited by " + inv.inviter.tag + " invite ID: " + inv.code + " uses: " + inv.uses);
				initialInvites.get(inv.code).uses = inv.uses;
				console.log("invite used is: " + inv.code);
				return;
			}else{
				console.log(`inv uses: ${inv.uses} init uses: ${initialInvites.get(inv.code).uses}`);
			}
		})
	})
	.catch(console.error);

	bellpost.send(" I don't know who invited " + member.user.tag + " sorry!")


	console.log("initial invites " + [...initialInvites]);
}


function checkSwear(message){
	var msg = message.content.toLowerCase().split(' ');
	for(var i = 0; i < swear.swears.length; i++){
		if(msg.includes(swear.swears[i])){
			return true;
		}
	}
	return false;
}

function filterSwears(message){
	var msg = message.content.toLowerCase().split(' ');
	for(var i = 0; i < msg.length; i++){
		for(var j = 0; j < swear.swears.length; j++){
			if(msg[i].startsWith(swear.swears[j])){
				msg[i] = "!@#$%";
			}
		}
	}
	var filteredMsg = "";
	for(var i = 0; i < msg.length; i++){
		filteredMsg += msg[i];
		filteredMsg += ' ';
	}
	return filteredMsg;

}

var mods = ['233094561910620162', '282340868705222667', '119872967923597313', '356670181130633218', '164815816699805696', '198546199249158144'];

function logKick(reaction){
	if(reaction.message.author.avatarURL == null){
		var url = kinURL;
	}else{
		var url = reaction.message.author.avatarURL.split('?')[0];
	}

	if(reaction.message.attachments.size){
		var imgUrl = reaction.message.attachments.first().url;
		var hasImg = true;
	}else{
		var imgUrl = ' ';
	}

	var beanURL = 'https://cdn.discordapp.com/emojis/364804042934714370.png'

	var embed = new Discord.RichEmbed()
	.setColor("#AA0000")
	.setAuthor(`${reaction.message.author.tag}  votekicked for: `, beanURL)	
	.setDescription(`${reaction.message.content}`)
	.setThumbnail(url);
	if(hasImg){
		embed.setImage(imgUrl);
	}

	//VK.stats.kicks.push(`votekicked ${reaction.message.author.tag} for ${reaction.message.content}`);
	console.log("sending message to hallchan: " + JSON.stringify(embed));
	hallchan.send({embed});

}

bot.on('messageReactionAdd', (messageReaction, user) => {
	if(votekick.checkReactionAdd(messageReaction)){
		logKick(messageReaction);
	}	

	if(messageReaction.message.channel != hallchan){
		sb.checkReaction(messageReaction);
	}

});


var sameArrayID = [];
var sameArray = [];
var sameMsg = "";

bot.on('message', message => {
	if(message.author.bot || message.author.id == '401684543326781440'){
		return;
	}

	plague.checkMention(message);

	if(message.channel === botpost && !message.author.bot){
		tts.spamTTS(message);
	}
	
	if(message.channel === chanGeneral && !message.author.bot){
		tts.generalTTS(message);
		
	}

	if(message.content === "]joinVC"){
		tts.joinVC(message);
		return;
	}
	
	if(message.content === "]quitVC"){
		if(bot.voiceConnections.has(message.guild.id)){
			let voice = bot.voiceConnections.get(message.guild.id);
			voice.disconnect();
		}
		return;
	}
	
	if(message.content.startsWith("]userTTS")){
		tts.toggleUserTTS(message);
		return;
	}
	
	if(message.content.startsWith("]generalTTS")){
		tts.toggleGenTTS(message);
		return;
	}
	
	if(message.content.startsWith("]spamTTS")){
		tts.toggleSpamTTS(message);
		return;
	}

	if(message.content.startsWith("]tts ")){
		tts.userTTS(message);
		return;
	}

	if(message.content.startsWith("]markovtts")){
		tts.markovTTS(message, markov.genSingleRandom());
		return;
	}
	
	if(message.content === "]mylang"){
		if(!message.author.hasOwnProperty('langCode')){
			message.author.langCode = 'en';
		}
		message.reply("Your current lang is: " + message.author.langCode);
		return;
	}
	
	if(message.content.startsWith("]dec ")){
		tts.decTTS(message);
		return;
	}
	if(message.isMentioned("477991829925527572")){
		modchat.send("Moderators ping from: " + message.author.username + " in: " + message.channel + message.cleanContent + "\n\n" + "https://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id);
		return;
	}
	if(message.channel.id == chanGeneral.id && !sameArrayID.includes(message.author.id) && message.author.id != bot.user.id){
		sameArray.push(message.cleanContent.toLowerCase());
		sameArrayID.push(message.author.id);
	}

	if(sameArray.length > 3){
		sameArray.shift();
		sameArrayID.shift();
		if(sameArray[0] == sameArray[1] && sameArray[0] == sameArray[2] && message.cleanContent.toLowerCase() != sameMsg){
			sameMsg = message.cleanContent.toLowerCase();
			setTimeout(function(){
				message.channel.send(message.cleanContent.toLowerCase())
			}, Math.floor(50 + Math.random() * 750));
		}

		//console.log("array: " + sameArray);
	}
	
	if(!message.isMentioned(bot.user.id) && message.channel.id == chanGeneral.id && message.cleanContent.trim().split(/ +/g).length >= 3){
		markov.addDict(message.cleanContent);
		//console.log("added to markov: " + message.cleanContent);
	}


	try{
		if(message.guild !== null && message.member.roles.has('317763990270902274')){
			//sendMessage(message.channel, "You are command muted. Do not bot pretzels or mushrooms boyo.");
			return; //command mute role
		}
	}
	catch(err) {
		console.log(err);
	}

	if(mods.includes(message.author.id)){
		if(message.content.startsWith("]addSwear ")){
			var word = message.content.slice(10).toLowerCase();
			if(swear.swears.includes(word)){
				sendMessage(message.channel, "That word is already in the swear list");
				return;
			}
			swear.swears.push(word);
			sendMessage(message.channel, word + " added to list of swears");
			save.jsonSave(swear, "swears.json");
			return;
		}
 
		if(message.content.startsWith("]removeSwear ")){
			var word = message.content.slice(13);
			if(swear.swears.includes(word)){
				swear.swears.splice(swear.swears.indexOf(word), 1);
				sendMessage( message.channel, word + " removed from list of swears");
				save.jsonSave(swear, "swears.json");	
				return;
			}
			sendMessage(message.channel, "That word wasn't in the list of swears.");
			return;
		}
	}

	if(message.channel == chanGeneral && filter == true){
		if(checkSwear(message)){
			sendMessage(message.channel, message.author + " Please remember rule 11. Your message was deleted for containing profanity, `" + filterSwears(message) + "`");
			message.delete();
			return;
		}
		
	}

	if(message.content == "]printSwears"){
		var txt = "";
		for(var i = 0; i < swear.swears.length; i++){
			txt += swear.swears[i];
			txt += ' ';
		}
		sendMessage(message.channel, txt);
	}

	if(message.content == "]stopfilter"){
		filter = false;
		sendMessage(message.channel, "yeah fuck rule 11!");
	}

	if(message.content == "]startfilter" && mods.includes(message.author.id)){
		message.channel.send("Rule 11 is now in effect. All vulgar language is now banned. Extreme force will be used.")
		filter = true;
	}

	if(message.content.startsWith(']votekickUsers')){
		message.reply(votekick.listUsers());
	}

	if(message.content == ']votekick'){
		message.reply(`To opt into the voteckick by beand react game and get votekicked if you get 7 beand reactions to your message, type **]optinvotekickbeandreact** you won't be able to opt out afterwards until you're kicked so choose wisely ;)`);
	}
	if(message.content.startsWith(']optinvotekickbeandreact')){
		votekick.apply(message);
	}

	if(message.content.startsWith(']vkaddblacklist ')){
		if(!mods.includes(message.author.id)){
			message.reply("nah.");
			return;
		}
		if(!message.mentions.users.first()){
			console.log("no mention");
			return;
		}else{ 
			var userID = message.mentions.users.first().id;
		}
		
		message.reply(votekick.addBlackList(userID));
	}

	if(message.content.startsWith(']hooktest ')){
		return;
		hook.send(message.content.slice(10), {
			username: message.author.username, 
			avatarURL: message.author.avatarURL,
			disableEveryone: true
		})
		.then(console.log)
		.catch(console.error);
	}

	if(message.content == "]startoggle"){
		sb.toggleChannel(message);
	}
	
	if(message.content == ']mostroles'){
		var roles = [...message.guild.roles.values()];
		var array = [];

		function compare(a, b){
			var a1 = a.members.size;
			var b1 = b.members.size;
			return b1 - a1;
		}

		roles.sort(compare);
		roles.forEach(r => {
			var str = r.name + " **" + r.members.size.toString() + "** members";
			array.push(str);
			//console.log(r.members.size);
		})

		var pg = new page.Page(bot, "Most used roles: ", array, 20);
		//console.log(array);
		pg.send(message.channel);
		return;
	}

	if(message.content.startsWith(']deafme ')){
		let args = message.content.split(' ');
		let minutes = Math.round(parseInt(args[1]));
		let role = message.guild.roles.find('name', 'deaf');
		let logMsg;
		if(isNaN(minutes) || minutes <= 0){
			message.reply("]muteme <number of minutes up to 180>");
			return;
		}
		minutes = Math.min(180, minutes);

		message.member.addRole(role)
		.catch(console.error);

		//message.reply(" Okay I'll mute you for " + minutes + " minutes.");
		modlogs.send("deafened " + message.author + " for " + minutes + " minutes on request.")
		.then(msg => logMsg = msg)
		.catch(console.error);
		
		setTimeout(function(){

			message.member.removeRole(role)
			.then(() => {
				console.log("removed mute role");
				logMsg.delete()
				.then(() => {
					console.log("deleted mute log");
					return;
				})
				.catch(console.error);
			})
			.catch(console.error);
			//console.log("error: couldn't remove deaf role");
		}, (60000 * minutes));
	}
	if(message.content.startsWith(']muteme ')){
		let args = message.content.split(' ');
		let minutes = Math.round(parseInt(args[1]));
		let role = message.guild.roles.find('name', 'nadeko-mute');
		let logMsg;
		if(isNaN(minutes) || minutes <= 0){
			message.reply("]muteme <number of minutes up to 180>");
			return;
		}
		minutes = Math.min(180, minutes);

		message.member.addRole(role)
		.catch(console.error);

		//message.reply(" Okay I'll mute you for " + minutes + " minutes.");
		modlogs.send("muted " + message.author + " for " + minutes + " minutes on request.")
		.then(msg => logMsg = msg)
		.catch(console.error);
		
		setTimeout(function(){

			message.member.removeRole(role)
			.then(() => {
				console.log("removed mute role");
				logMsg.delete()
				.then( () => {
					console.log("deleted mute log");
					return;
				})
				.catch(console.error);
			})
			.catch(console.error);
			
			//console.log("error: mute didn't delete");
		}, (60000 * minutes));
	}
	
	if(message.content == ']rent-a-role'){
		message.channel.send("Thanks for choosing Rent-A-Role! Currently it costs " + rentarole.getPrice() + ":mushroom: per day to rent a custom role. \n`]rent-a-role 1` replace 1 with the number of days you want to rent for. \n`]rentcolor #ff00ff` to change your color \n`]rentname Super Awesome Role Name` to change its name. \n`]renttime` to see how much time you have left.\nAre you poor? Try renting somebody else's role for a lower price!\n`]rentshare` to see the roles available to rent\n`]buyrentshare owner#1234` of the owner you want to rent from to rent that role! \nHave a nice day!");
		return;
	}

	if(message.content.startsWith(']rent-a-role ')){
		rentarole.rentNew(message);
		return;
	}

	if(message.content.startsWith(']rentcolor ')){
		rentarole.changeColor(message);
		return;
	}

	if(message.content.startsWith(']rentname')){
		rentarole.changeName(message);
		return;
	}

	if(message.content.startsWith(']setrentprice ')){
		var args = message.content.split(' ');
		var price = parseInt(args[1]);

		if(isNaN(price) || price < 10){
			return;
		}

		if(!message.member.permissions.has("ADMINISTRATOR")){
			message.reply(" I'm sorry, I can't let you do that.");
			return;
		}
		message.reply("Okay I'll set the price to " + price);
		rentarole.setPrice(price);
		return;
	}

	if(message.content.startsWith(']renttime')){
		rentarole.timeLeft(message);
		return;
	}

	if(message.content.startsWith(']rentshare')){
		rentarole.listRentshare(message);
		return;
	}

	if(message.content.startsWith(']buyrentshare ')){
		rentarole.buyRentshare(message);
		return;
	}

	if(message.content.startsWith(']setshareprice ')){
		var args = message.content.split(' ');
		var price = parseInt(args[1]);

		if(isNaN(price) || price < 10){
			return;
		}

		if(!message.member.permissions.has("ADMINISTRATOR")){
			message.reply(" I'm sorry, I can't let you do that.");
			return;
		}
		message.reply("Okay I'll set the price to " + price);
		rentarole.setSharePrice(price);
		return;
	}

	if(message.content.startsWith(']inviteEnable')){
		if(!message.member.permissions.has("ADMINISTRATOR")){
			message.reply(" I'm sorry, I can't let you do that.");
			return;
		}

		var options = {
			uri: "https://invite.2honest42meirl.com/kinoko.php?authtoken=" + inviteAuth + "&action=enable&value=true",
			method: 'GET',
		}

		request(options, function(error, response, body){
			//console.log(response);
		});

		message.channel.send("Ok I've enabled the invite link.");
		return;
	}

	if(message.content.startsWith(']inviteDisable')){
		if(!message.member.permissions.has("ADMINISTRATOR")){
			message.reply(" I'm sorry, I can't let you do that.");
			return;
		}

		var options = {
			uri: "https://invite.2honest42meirl.com/kinoko.php?authtoken=" + inviteAuth + "&action=enable&value=false",
			method: 'GET',
		}

		request(options, function(error, response, body){
			//console.log(response);
		});

		message.channel.send("Ok I've disabled the invite link.");
		return;
	}

	if(message.content.startsWith(']inviteCode ')){
		if(!message.member.permissions.has("ADMINISTRATOR")){
			message.reply(" I'm sorry, I can't let you do that.");
			return;
		}

		var code = message.content.split(' ')[1];

		if(!code.length){
			message.reply("something's wrong");
			return;
		}
		//https://invite.2honest42meirl.com/kinoko.php?authtoken=$token&action=enable/update&value=true:false/invite-code
		var options = {
			uri: "https://invite.2honest42meirl.com/kinoko.php?authtoken=" + inviteAuth + "&action=update&value=" + code,
			method: 'GET',
		}

		request(options, function(error, response, body){
			//console.log(response);
		});

		message.channel.send("Ok I've updated the invite link to use invite code " + code);
		return;
	}
	
	if(message.content.startsWith(']markov2')){
		message.channel.send(markov.genRandom());
		return;
	}

	if(message.content.startsWith(']markov1')){
		message.channel.send(markov.genSingleRandom());
		return;
	}

	if(message.content.startsWith(']markov ')){
		message.channel.send(markov.genSingleWord(message.content.trim().split(' ')[1]));
	}

	if(message.content.startsWith('libtard ban ')){
		let command = 'libtard ban ';
		let str = message.cleanContent.slice(command.length);
		if(str.length <= 0) return;

		message.channel.send("The libtard " + str + " was trolled epic style and left the server." )
	}
	//smods
	if(message.member != null && message.member.roles.has('487732133050449940')){
		if(message.content.startsWith(']mute ') && message.mentions.users.size){
			let role = message.guild.roles.find('name', 'nadeko-mute');
			guild.members.get(message.mentions.users.first().id).addRole(role)
			.then(message.reply("Okay I muted " + message.mentions.users.first().tag))
			.catch(console.error);
			return;
		}

		if(message.content.startsWith(']unmute ') && message.mentions.users.size){
			let role = message.guild.roles.find('name', 'nadeko-mute');
			guild.members.get(message.mentions.users.first().id).removeRole(role)
			.then(message.reply("Okay I unmuted " + message.mentions.users.first().tag))
			.catch(console.error);
			return;
		}
	}


	if(message.member != null && message.member.permissions.has("ADMINISTRATOR")){
		if(message.content.startsWith('libtard mute ') && message.mentions.users.size){
			let role = message.guild.roles.find('name', 'nadeko-mute');
			guild.members.get(message.mentions.users.first().id).addRole(role)
			.then(message.reply("Okay I muted " + message.mentions.users.first().tag))
			.catch(console.error);
			return;
		}

		if(message.content.startsWith('libtard unmute ') && message.mentions.users.size){
			let role = message.guild.roles.find('name', 'nadeko-mute');
			guild.members.get(message.mentions.users.first().id).removeRole(role)
			.then(message.reply("Okay I unmuted " + message.mentions.users.first().tag))
			.catch(console.error);
			return;
		}

		if(message.content.startsWith('libtard kick ')){
			guild.members.get(message.mentions.users.first().id).kick("kicked by " + message.author.username)
			.catch(console.error);
			return;
		}
	}

	//webhook personas
	if(message.content.startsWith(']randomSays ')){
		let phrase = message.content.slice(12);
		if(!phrase.length) return;

		let user = bot.users.random();
		let avatarURL = user.avatarURL.split('?')[0];

		botspamHook.send(phrase, {
			username: user.username, 
			avatarURL: avatarURL,
			disableEveryone: true
		})
		.then(console.log)
		.catch(console.error);
	}

	if(message.content.startsWith(']randomMarkovs')){
		let user = bot.users.random();
		if(user.avatarURL == null) return;
		let avatarURL = user.avatarURL.split('?')[0];
		console.log(avatarURL);
		botspamHook.send(markov.genSingleRandom(), {
			username: user.username,
			avatarURL: avatarURL,
			disableEveryone: true
		})
		.then(console.log)
		.catch(console.error);
	}



	if(message.content.startsWith(']inspiro')){
		request('http://inspirobot.me/api?generate=true', function (error, response, body) {
			if(error) console.log(error);
			if (!error && response.statusCode == 200) {
				message.channel.send(body);
			}
		});
	}

	if(message.content.startsWith(']mindful')){
		inspiroMindful.playRequest(message);
	}

	if(message.content.startsWith(']cleanse')){
		plague.cleanseUser(message);
	}

	if(message.content.startsWith(']iamadoctor')){
		plague.makeMeDoctor(message);
	}

	if(message.content.startsWith(']heal ')){
		plague.healUser(message);
	}

	if(message.content.startsWith(']blessme')){
		plague.blessMe(message);
	}

	if(message.content.startsWith(']PERFORMTHERITUAL')){
		plague.unholyRitual(message);
	}

	if(message.content.startsWith(']exorcise ')){
		plague.exorciseUser(message);
	}

	if(message.content.startsWith(']bless ')){
		plague.ordainUser(message);
	}

});

function sendMessage(channel, message){
		console.log("LOGGING chANneL: " + channel + "\n Message: " + message);
		channel.send(message);
}

bot.login(config.tokenBot);
votekick.bot = bot;

//this is the bot account. the other is user.