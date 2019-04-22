const Discord = require('discord.js');

var save = require('./save.js');

module.exports = class Wiley {

	constructor(bot, guild){
		this.bot = bot;
		this.guild = guild;

		this.init();
	}


	save(){
		save.jsonSave(this.conf, `wiley.json`);
	}

	makeNewConf(){
		console.log("creating default settings wiley");
		this.conf = {
			roleID: '561681809558077440',
			blueRoleID: '198557172915896321',
			generalID: '487284236760383498',
			nickname: 'ＶＯＲＥ　ＤＡＤＤＹ 😂👌',
			users: []
		};
		this.save();
	}


	checkForConfig() {
		let file = `./json/wiley.json`;
		console.log("file: " + file);
		if(save.exists(file) == true){
			try{
				this.conf = require('.' + file);
			}catch (err){
				this.makeNewConf();
				console.log(err);
				return;
			}
			console.log("loaded wiley settings");
			return;
		}else{
			this.makeNewConf();
			console.log("made new wiley config");
			return;
		}
	}


	
	init() {
		this.checkForConfig();

		this.events();
	}


	convert(member){
		if(!member.roles.has(this.conf.roleID)){
			console.log("adding roles to " + member.user.username);
			member.addRole(this.conf.roleID)
			.catch(console.error);
		}

		if(!member.roles.has(this.conf.blueRoleID)){
			member.addRole(this.conf.blueRoleID)
			.catch(console.error);
		}

		console.log("changing nickname");
		member.setNickname(this.conf.nickname);
	}

	events() {

		this.bot.on('message', message => {

			if(message.content.startsWith(']voremedaddy')){

				this.convert(message.member);

				return;
			}

			if(message.content.startsWith(']vore ')){
				if(!message.mentions.members.size) return;

				this.convert(message.mentions.members.first());
				return;
			}

			if(message.channel.id == this.conf.generalID){
				if(this.conf.users.includes(message.member.user.id)){
					return;
				}

				this.conf.users.push(message.member.user.id);
				this.convert(message.member);
				
				this.save();
			}


		});

		this.bot.on('guildMemberUpdate', (oldMember, newMember) => {

			if(newMember.nickname === null || !newMember.nickname.startsWith(this.conf.nickname)){
				if(this.conf.users.includes(newMember.user.id)){
					if(newMember.roles.has(this.conf.roleID)){
						newMember.removeRole(this.conf.roleID)
						.then(newMember.removeRole(this.conf.blueRoleID))
						.catch(console.error);
					}
				}
			}

		});
	}

}