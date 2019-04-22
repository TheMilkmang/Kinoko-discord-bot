const Discord = require('discord.js');

var save = require('./save.js');

module.exports = class Utility {

	constructor(bot, guild){
		this.bot = bot;
		this.guildID = guild;

		this.checkForConfig();
		this.events();
	}


	save(){
		save.jsonSave(this.conf, `utility.json`);
	}

	makeNewConf(){
		console.log("creating default settings utility");
		this.conf = {
			mute: {
				roleID: '300869323667406848',
				logChanID: '487289361151295498',
				maxMinutes: 1440,
				users: []
			}
		};
		this.save();
	}

	checkForConfig() {
		let file = `./json/utility.json`;
		console.log("file: " + file);
		if(save.exists(file) == true){
			try{
				this.conf = require('.' + file);
			}catch (err){
				this.makeNewConf();
				console.log(err);
				return;
			}
			console.log("loaded utility settings");
			return;
		}else{
			this.makeNewConf();
			console.log("made new utility config");
			return;
		}
	}

	addToMutes(userID, minutes, logMsgID, deleteLater){
		let d = new Date();
		let ms = d.getTime();
		let future = ms + (minutes*1000*60);
		let index = this.conf.mute.users.findIndex( e => {e.id == userID});

		if(index !== -1){
			this.conf.mute.users.splice(index, 1);
		}

		this.conf.mute.users.push({
			id: userID,
			time: future,
			msgID: logMsgID,
			deleteLater: deleteLater 
		});

		this.save();
	}

	sendModlog(message){
		return new Promise(function(resolve, reject){
			let modlogs = this.bot.channels.get(this.conf.mute.logChanID);

			modlogs.send(message)
			.then(msg => resolve(msg.id))
			.catch(console.error);
		});

	}

	mute(member, minutes, logMsg, deleteLater){
		member.addRole(this.conf.mute.roleID)
		.catch(console.error);

		sendModlog(logMsg)
		.then(msgID => {
			addToMutes(member.user.id, minutes, msgID, deleteLater);
		})
		.catch(console.error);
			
	}

	unmute(userID){
		let member = this.bot.guilds.get(this.guild).members.get(userID);
		if(member === null) return;

		let index = this.conf.mute.users.findIndex( e => {e.id == userID});
		if(index === -1) return;

		member.removeRole(this.conf.mute.roleID);
		
		let modlogs = this.bot.channels.get(this.conf.mute.logChanID);
		modlogs.fetchMessage(this.conf.mute.users[index].msgID)
		.then(msg => {
			if(msg !== null && this.conf.mute.users[index].deleteLater){
				msg.delete()
				.catch(console.error);
			}
		})
		.catch(console.error);

		this.conf.mute.users.splice(index, 1);
		this.save();
	}

	checkMuteQueue(){
		if(!this.conf.mute.users.length) return;
		
		let d = new Date();
		let ms = d.getTime();

		for(let i = 0; i < this.conf.mute.users; i++){
			if(this.conf.mute.users[i].time <= ms){
				this.unmute(this.conf.mute.users[i].id);
				break;
			}
		}
		
	}

	events() {

		this.bot.on('message', message => {

			if(message.content.startsWith(']muteme ')){
				let args = message.content.split(' ');
				let minutes = Math.round(parseInt(args[1]));

				if(isNaN(minutes) || minutes <= 0){
					message.reply("]muteme <number of minutes up to 1,440>");
					return;
				}
				minutes = Math.min(this.conf.mute.maxMinutes, minutes);

				let logMsg = `muted ${member.user.tag} for ${minutes} minutes on request.`
				this.mute(message.member, minutes, logMsg, true);
				return;
			}


		});
}