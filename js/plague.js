const Discord = require('discord.js');

var save = require('./save.js');

module.exports = class Markov {

	constructor(bot, guild){
		this.bot = bot;
		this.guild = guild;

		this.init();
	}


	save(){
		save.jsonSave(this.conf, `plague.json`);
	}

	makeNewConf(){
		console.log("creating default settings plague");
		this.conf = {
			plaguedID: '550933632790036522',
			cleansedID: '550933643195973635',
			damnedID: '550933644953518090',
			priestID: '477991829925527572',
			warned: [],
			saved: [],
			damned: [],
			warnMessage: ' ❗ **CURSED** ❗ You feel the icy touch of the devil on your soul. Pinging this role again will curse you and assign the role to you permanently.',
			plaguedMessage: ' 💀 You now have the Unholy Plague.',
			damnedMessage: "👹 You indulge in the Unholy Plague again and feel it overwhelm you. You're now just another damned soul, cursed forever."
		};
		this.save();
	}


	checkForConfig() {
		let file = `./json/plague.json`;
		console.log("file: " + file);
		if(save.exists(file) == true){
			try{
				this.conf = require('.' + file);
			}catch (err){
				this.makeNewConf();
				console.log(err);
				return;
			}
			console.log("loaded plague settings");
			return;
		}else{
			this.makeNewConf();
			console.log("made new plague config");
			return;
		}
	}


	
	init() {
		this.checkForConfig();
		this.conf.doctorID = '551071062184427562';
		this.conf.templeID = '550949426064130048'
		if(!this.conf.hasOwnProperty('superDoctor')){
			this.conf.superDoctor = [];
		}

		if(!this.conf.hasOwnProperty('superDamned')){
			this.conf.superDamned = [];
		}
	}

	checkMention(message){
		if( !message.isMentioned(this.conf.plaguedID) ) return;

		if( message.member.roles.has(this.conf.plaguedID) ) return;

		if(this.checkDoctor(message.member)){
			message.reply("YOU ARE NO LONGER A PLAGUE DOCTOR.");
		}

		if( this.conf.saved.includes(message.author.id) ){
			this.setDamned(message.member);
			message.reply(this.conf.damnedMessage);
			return;
		}

		if( this.conf.warned.includes(message.author.id) ){
			this.setPlagued(message.member);
			message.reply(this.conf.plaguedMessage);
			return;
		}

		this.setWarned(message.member);
		message.reply(this.conf.warnMessage);
		return;
	}

	setDamned(member){
		if(member.roles.has(this.conf.cleansedID)){
			member.removeRole(this.conf.cleansedID);
		}

		if(!member.roles.has(this.conf.damnedID)){
			member.addRole(this.conf.damnedID);
		}

		if(!member.roles.has(this.conf.plaguedID)){
			member.addRole(this.conf.plaguedID);
		}

		if(!this.conf.damned.includes(member.id)){
			this.conf.damned.push(member.id);
		}

		this.save();
	}

	setPlagued(member){
		if(!member.roles.has(this.conf.plaguedID)){
			member.addRole(this.conf.plaguedID);
		}
	}

	setWarned(member){
		this.conf.warned.push(member.id);
		this.save();
	}


	checkDoctor(member){
		if(member.roles.has(this.conf.doctorID)){
			member.removeRole(this.conf.doctorID);
			return true;
		}

		return false;
	}
	cleanseUser(message){
		if(!message.mentions.members.size){ 
			console.log("no mentions");
			return;
		}

		if(!message.member.roles.has(this.conf.priestID)){
			console.log("no priest id");
			return;
		}

		if(message.channel.id != this.conf.templeID){
			message.reply("This must be done in the Holy Temple.");
			return;
		}

		let user = message.mentions.members.first();

		if(!user.roles.has(this.conf.plaguedID)){
			console.log("user isn't plagued");
			message.reply(user.user.username + " isn't plagued!");
			return;
		}


		if(this.conf.damned.includes(user.id)){
			message.channel.send(user.user.username + " has chosen sin over holiness and cannot be saved.");
			return;
		}

		user.removeRole(this.conf.plaguedID);
		

		if(!user.roles.has(this.conf.cleansedID)){
			user.addRole(this.conf.cleansedID);
		}

		this.conf.saved.push(user.id);
		this.save();

		message.channel.send("👼 The Unholy Plague has been dispelled from " + user.user.username + "! This is surely a miracle that can only be done once...");
	}

	makeMeDoctor(message){
		if(this.conf.saved.includes(message.author.id) || this.conf.damned.includes(message.author.id) || message.member.roles.has(this.plaguedID)){
			message.reply("You've already been exposed to the plague. You cannot heal others.");
			return;
		}

		if(message.member.roles.has(this.conf.doctor)){
			message.reply("You are already a plague doctor! Heal the sick who request it!");
			return;
		}

		message.member.addRole(this.conf.doctorID);
		message.reply("Congratulations you are an official plague doctor! Heal the sick who request it by doing ]heal @someone");

	}

	blessMe(message){
		if(message.member.roles.has(this.conf.doctorID)){
			message.reply("👼 A warm light surrounds you as you feel the power to save even the damned be given to you. Be **__cautious__** though, for not every damned user wants to be saved and they often act with trickery. You can now exorcise someone by doing ]exorcise @someone")
			this.conf.superDoctor.push(message.author.id);
		}else{
			message.reply("You're not even a doctor, pleb.")
		}
		this.save();
	}

	unholyRitual(message){
		if(message.channel.id != '551067776341639169'){
			return;
		}

		if(message.member.roles.has(this.conf.damnedID)){
			message.reply("You sacrifice everything and devote yourself to the Unholy Plague. There's no going back now. If someone tries to exorcise you, they'll lose all their power and become damned themselves.");
			this.conf.superDamned.push(message.author.id);
			this.save();
		}
	}

	ordainUser(message){
		if(!message.mentions.members.size){ 
			console.log("no mentions");
			return;
		}

		if(!message.member.roles.has(this.conf.doctorID)){
			console.log("no doctor id");
			message.reply("You're not a doctor!");
			return;
		}

		if(!this.conf.superDoctor.includes(message.author.id)){
			message.reply("You must be ordained as a Bishop to do this. Do ]blessme to do so.");
			return;
		}

		if(message.channel.id != this.conf.templeID){
			message.reply("This must be done in the Holy Temple.");
			return;
		}
		
		let user = message.mentions.members.first();


		if(this.conf.warned.includes(user.id)){
			message.reply(user.user.username + " has pinged the unholy plague and cannot be redeemed from this act.");
			return;
		}
		
		if(user.roles.has(this.conf.doctorID)){
			message.reply(user.user.username + " is already a doctor!");
			return;
		}

		if(user.roles.has(this.conf.damnedID)){
			user.removeRole(this.conf.damnedID);
		}

		user.addRole(this.conf.doctorID);


		message.reply(user.user.username + "'s soul is restored. They can now heal others again!");
	}

	exorciseUser(message){
		if(!message.mentions.members.size){ 
			console.log("no mentions");
			return;
		}

		if(!message.member.roles.has(this.conf.doctorID)){
			console.log("no doctor id");
			message.reply("You're not a doctor!");
			return;
		}

		if(!this.conf.superDoctor.includes(message.author.id)){
			message.reply("You must be ordained as a Bishop to do this. Do ]blessme to do so.");
			return;
		}

		if(message.channel.id != this.conf.templeID){
			message.reply("This must be done in the Holy Temple.");
			return;
		}
		
		let user = message.mentions.members.first();

		if(!user.roles.has(this.conf.plaguedID)){
			if(!user.roles.has(this.conf.damnedID)){
				console.log("user isn't plagued");
				message.reply(user.user.username + " isn't plagued!");
				return;
			}
		}


		if(!this.conf.damned.includes(user.id)){
			message.channel.send(user.user.username + " is not damned. Use lesser medicine first.");
			return;
		}

		if(this.conf.superDamned.includes(user.id)){
			message.reply("❗ ❗ You feel the dark energy you were trying to remove from " + user.user.username + " grab you and taint your very soul. " + user.user.username + " underwent a ritual to corrupt those who try to heal them. You'll never be able to doctor again.");
			this.conf.damned.push(message.author.id);
			message.member.addRole(this.conf.damnedID);
			message.member.removeRole(this.conf.doctorID);
			this.save();
			return;
		}
		if(user.roles.has(this.conf.plaguedID)){

			user.removeRole(this.conf.plaguedID);
		}
		if(user.roles.has(this.conf.damnedID)){
			user.removeRole(this.conf.damnedID);
		}

		if(user.roles.has(this.conf.cleansedID)){
			user.removeRole(this.conf.cleansedID);
		}


		message.channel.send("The Unholy Plague has been exorcised from " + user.user.username + " using a combination of powerful scripture and medicine. Even the damned have hope now...")
		//this.conf.saved.push(user.id);
		this.save();
	}

	healUser(message){
		if(!message.mentions.members.size){ 
			console.log("no mentions");
			return;
		}

		if(!message.member.roles.has(this.conf.doctorID)){
			console.log("no doctor id");
			message.reply("You're not a doctor!");
			return;
		}

		if(message.channel.id != this.conf.templeID){
			message.reply("This must be done in the Holy Temple.");
			return;
		}
		
		let user = message.mentions.members.first();

		if(!user.roles.has(this.conf.plaguedID)){
			console.log("user isn't plagued");
			message.reply(user.user.username + " isn't plagued!");
			return;
		}


		if(this.conf.damned.includes(user.id)){
			message.channel.send(user.user.username + " has chosen sin over holiness and cannot be healed.");
			return;
		}

		user.removeRole(this.conf.plaguedID);
		

		if(!user.roles.has(this.conf.cleansedID)){
			user.addRole(this.conf.cleansedID);
		}

		this.conf.saved.push(user.id);
		this.save();

		message.channel.send("💉 The Unholy Plague has been dispelled from " + user.user.username + " using advanced plague doctor technology! This is surely a miracle that can only be done once...");
	}
}