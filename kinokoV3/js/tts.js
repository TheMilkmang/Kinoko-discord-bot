var googleTTS = require('google-tts-api');
const playArbitraryFFmpeg = require('discord.js-arbitrary-ffmpeg');

var config = require('../json/config.json');
var save = require('./save.js');


var VC = false;
var vcMessages = [];
var canSpeak = true;

var userTTS = false;
var generalTTS = false;
var spamTTS = false;

var unusedLangs = config.goodLangs.slice();

function playTTS(){
	
	if(VC == false)return;
	
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

function ttsCleanMessage(str){ // get rid of emojis and links
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

exports.spamTTS = function(message){
	
	if( !spamTTS || !VC )return;
	
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
};

exports.generalTTS = function(message){
	
	if( !generalTTS || !VC)return;
	
	var cleanMessage = ttsCleanMessage(message.content);
	console.log(cleanMessage);
	if(cleanMessage.length > 200 || cleanMessage.length == 0)return;

	if(!message.author.hasOwnProperty('langCode')){
		
		if(unusedLangs.length){
			
			var codeIndex = Math.floor(Math.random() * unusedLangs.length);
			
			message.author.langCode = config.goodLangs[codeIndex];
			unusedLangs.splice(codeIndex, 1);
			
		}else{
			message.author.langCode = config.goodLangs[Math.floor(Math.random() * config.goodLangs.length)];
		}
	}

	var ttsObj = { message: cleanMessage, lang: message.author.langCode, speed: 1 };

	console.log("doing gen voice on message: " + ttsObj.message + "\n Lang code: " + ttsObj.lang);

	vcMessages.push(ttsObj);
	playTTS();
};

exports.joinVC = function(message){
	if(VC !== false){
		message.reply("I think I'm already in a VC channel...");
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
};

exports.quitVC = function(message){
	if(VC !== false){
		VC.disconnect();
	}
};

exports.toggleUserTTS = function(message){
	if(!userTTS){
		userTTS = true;
		generalTTS = false;
		spamTTS = false
		message.reply("User TTS enabled. General TTS disabled. Type ]tts <message> to speak!");
	}else{
		userTTS = false;
		message.reply("User TTS disabled.");
	}
};

exports.toggleGenTTS = function(message){
	if(message.author.id != '282340868705222667')return;
	
	if(!generalTTS){
		generalTTS = true;
		userTTS = false;
		spamTTS = false
		message.reply("General TTS enabled. User TTS disabled. Listen to them talk xd");
	}else{
		generalTTS = false;
		message.reply("General TTS disabled. Wasn't it amusing though?");
	}
};

exports.toggleSpamTTS = function(message){
	if(!spamTTS){
		spamTTS = true;
		userTTS = false;
		generalTTS = false
		message.reply("Spam TTS enabled. User TTS disabled. Have fun");
	}else{
		spamTTS = false;
		message.reply("Spam TTS disabled. Wasn't it amusing though?");
	}
};

exports.userTTS = function(message){
	if(!userTTS){
		message.reply("user tts isn't enabled. Do ]userTTS to enable.");
		return;
	}
		
	
	var ttsMsg = message.content.slice(5); //"]tts "
	var lang = 'en';

	var cleanMessage = ttsCleanMessage(ttsMsg);
	if(cleanMessage.length > 200 || cleanMessage.length == 0){
		message.reply("TTS messages need to be less than 200 characters. Yours was " + ttsMsg.length + " characters.");
		return;
	}

	if(message.author.hasOwnProperty('langCode')){
		lang = message.author.langCode;
	}else{
		message.author.langCode = config.goodLangs[Math.floor(Math.random() * config.goodLangs.length)];
	}

	var ttsObj = { message: cleanMessage, lang: lang, speed: 1 };

	vcMessages.push(ttsObj);
	playTTS();	
};

exports.userTTSSpeed = function(message){
	console.log("ttsspeed");
	
	if(!userTTS){
		message.reply("user tts isn't enabled. Do ]userTTS to enable.");
		return;
	}
	
	var speed = message.content.split(' ')[1];
	speed = parseInt(speed);
	
	if(speed > 3){
		speed = 3;
	}else if(speed < 0.5){
		speed = 0.5;
	}
	
	var ttsMsg = message.content.slice(5); //"]tts "
	var lang = 'en';

	var cleanMessage = ttsCleanMessage(ttsMsg);
	if(cleanMessage.length > 200 || cleanMessage.length == 0){
		message.reply("TTS messages need to be less than 200 characters. Yours was " + ttsMsg.length + " characters.");
		return;
	}

	if(message.author.hasOwnProperty('langCode')){
		lang = message.author.langCode;
	}else{
		message.author.langCode = config.goodLangs[Math.floor(Math.random() * config.goodLangs.length)];
	}

	var ttsObj = { message: cleanMessage, lang: lang, speed: speed };

	vcMessages.push(ttsObj);
	playTTS();	
};

exports.decTTS = function(message){
	if(!userTTS){
		message.reply("user tts isn't enabled. Do ]userTTS to enable.");
		return;
	}
	
	var ttsMsg = message.content.slice(5);//"]dec "
		
	if(!VC.speaking){
		var url = "http://talk.moustacheminer.com/api/gen?dectalk=";
		url += encodeURIComponent(ttsMsg.trim());
		console.log("dec url: " + url);
		const dispatcher = VC.playArbitraryInput(url);
	}
};

exports.echoTTS = function(message){
	let arrFFmpegParams = [
    	'-i', 'http://epicmilk.com/dectalk1.wav',
    	'-af', 'aecho=0.8:0.88:6:0.4'
	];
	const objStreamDispatcher = playArbitraryFFmpeg(
    	VC, // A VoiceConnection from Discord.js 
    	arrFFmpegParams
	);
	console.log("tried to echo");
	
};