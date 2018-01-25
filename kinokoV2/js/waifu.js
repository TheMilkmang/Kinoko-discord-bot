const Discord = require('discord.js');
var inventory = require('../json/inventory.json');
var config = require('../json/config.json');
var save = require('./save.js');

var eggPrice = 1000;
var hatchTime = 60000*60*24;
var eggs = ['http://epicmilk.com/kinoko/eggbasic.png',
			'http://epicmilk.com/kinoko/eggblue.png',
			'http://epicmilk.com/kinoko/eggfuzzy.png',
			'http://epicmilk.com/kinoko/egggreen.png',
			'http://epicmilk.com/kinoko/eggpurple.png']
var waifus = [{name: 'Prinz Eugen',
			   images: ['http://epicmilk.com/kinoko/waifueugen1.png']},
			  {name: 'Mamimi',
			   images: ['http://epicmilk.com/kinoko/waifumamimi1.png']},
			  {name: 'Nyaruko',
			   images: ['http://epicmilk.com/kinoko/waifunyaruko1.png']},
			  {name: 'Reimu',
			   images: ['http://epicmilk.com/kinoko/waifureimu1.png']},
			  {name: 'Rem',
			   images: ['http://epicmilk.com/kinoko/waifurem1.png']},
			  {name: 'Kumiko',
			   images: ['http://epicmilk.com/kinoko/waifukumiko1.png']}];

var Waifu = function(egg, waifuType, hatchTime, username){
	this.egg = egg;
	this.waifuType = waifuType;
	this.name = 'egg';
	this.lvl = 0;
	this.hatchTime = hatchTime;
	this.owner = username;
	
	var d = new Date();
	this.createTime = d.getTime();
	
	this.upgradePrice = 500;
	
	this.rename = function(name){
		if(name.length > 40){
			name = name.slice(0,40);
		}
		if(name.length == 0){
			return;
		}
		this.name = name;
	}
	
	this.getName = function(){
		return this.name;
	}
	
	this.getType = function(){
		if(level > 0){
			return this.waifuType.name;
		}
		return 'egg';
	}
	
	this.hatch = function(){
		this.lvl = 1;
		
		if(this.name == 'egg'){
			this.name == this.waifuType.name;
		}
		return(this.owner + " Your egg hatched! It was a " + this.waifuType.name + "\n" + this.waifuType.images[0] + "\n");
	}
	
	this.update = function(){
		var d = new Date();
		var ms = d.getTime();
		if(this.lvl == 0){
			if( (this.createTime + this.hatchTime) <= ms ){
				save.jsonSave(inventory, 'inventory.json');
				return(this.hatch());
			}
		}else{
			return("");
		}		
	}
		
};

function restoreWaifus(){
	if(inventory.length == 0) return;
	
	for(i = 0; i < inventory.length; i++){
		if(inventory[i].waifus.length > 0){
			for(k = 0; k < inventory[i].waifus.length; k++){
				var waifu = new Waifu();
				var old = inventory[i].waifus[k];
				waifu.egg = old.egg;
				waifu.waifuType = old.waifuType;
				waifu.name = old.name;
				waifu.lvl = old.lvl;
				waifu.hatchTime = old.hatchTime;
				waifu.createTime = old.createTime;
				waifu.upgradePrice = old.upgradePrice;
				waifu.owner = old.owner;
				inventory[i].waifus[k] = waifu;
			}
		}
	}

}

restoreWaifus();
	
function inventoryFindByID(ID){
	for(i = 0; i<inventory.length; i++){
		if(inventory[i].id === ID){
			return inventory[i];
		}
	}
	return -1;
}

function inventoryFindByUser(user){
	var member = inventoryFindByID(user.id);
	if(member != -1){
		return member;
	}else{
		member = createMember(user);
		return member;
	}
		
}

function createMember(user){
	var index = inventory.push( {id: user.id, name: user.username, waifus: []}) - 1 ;
	save.jsonSave(inventory, 'inventory.json');
	return inventory[index];
}


exports.getinventoryMember = function(user){
	return inventoryFindByUser(user);
};
	
	
exports.getPrice = function(){
	return(eggPrice);
};

exports.buyEgg = function(message){
	var inv = inventoryFindByUser(message.author);
	var eggImg = eggs[Math.round( Math.random() * (eggs.length-1) )];
	var waifuImg = waifus[Math.round( Math.random() * (waifus.length - 1) )];
	var egg = new Waifu(eggImg, waifuImg, hatchTime, message.author.username);
	
	inv.waifus.push(egg);
	console.log(egg);
	save.jsonSave(inventory, 'inventory.json');
	return(eggImg + " Congrats, you bought an egg! It will hatch in " + egg.hatchTime / 60000 + " minutes. I wonder what it'll be!");
};

exports.getInventory = function(user){
	member = inventoryFindByUser(user);
	if(member.waifus.length){
		var returned = user + " You have: ";
		for(i = 0; i < member.waifus.length; i++){
			returned += member.waifus[i].name + ", ";
		}
		return(returned);
	}
	return("You have nothing, sorry.");
};

exports.updateAll = function(){
	var returned = "";
	if(inventory.length == 0)return;
	for(i = 0; i < inventory.length; i++){
		if(inventory[i].waifus.length){
			for(k = 0; k < inventory[i].waifus.length; k++){
				var tmp = inventory[i].waifus[k].update();
				if(tmp){
					returned += tmp;
				}
			}
		}
	}
	return(returned);
};