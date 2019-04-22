const request = require('request');


module.exports = class inspiroMindfulness {
	
	constructor(bot, guild) {
		this.bot = bot;
		this.guild = guild;
		this.sessionID = this.newSession();
		this.queue = [];
	}

	newSession(){
		request
		.get('http://inspirobot.me//api?getSessionID=1')
		.on('data', function(data) {
			return data.toString();
		});
	}

	playOne(url, vc){
		if(vc.speaking) return;

		vc.playArbitraryInput(url);

	}

	getOne(vc){
		let url = 'http://inspirobot.me/api?generateFlow=1&sessionID=' + this.sessionID;
		let self = this;
		request(url, function (error, response, body) {
			if(error) console.log(error);
			if (!error && response.statusCode == 200) {
				let data = JSON.parse(body);
				let URL = data.mp3;
				console.log(URL);
				self.playOne(URL, vc);
			}
		});
	}

	playRequest(message){
		if(this.bot.voiceConnections.has(this.guild)){
			let vc = this.bot.voiceConnections.get(this.guild);
			this.getOne(vc);
			return;
		}

		if(message.member.voiceChannel){
			message.member.voiceChannel.join()
			.then(connection => { // Connection is an instance of VoiceConnection
				let vc = connection;
				this.getOne(vc);
				return;
			})
			.catch(console.log);
		}else{
			message.reply("you need to join a voice channel.");
		}
	}
}