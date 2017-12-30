var config = require('../json/config.json');
var emoji = require('../json/emoji.json');

function worked(user, bank, amount, percentage, delay){
	bank.mushiesAddEveryone(amount*percentage);
	bank.addBalanceUser(user, (amount - amount*percentage) );
	bank.addTotalWorkedUser(user, amount);
	bank.setWorkTimerUser(user, delay);
}

function newHarvest(user, choices, rewardMax){
	var emojis = [];
		
	var returned = "Pick which one to harvest! Type ']harvest #'\n";

		
	for(i = 0; i < choices; i++){
		var randomEmoji = emoji.shortnames[ Math.floor( Math.random() * emoji.shortnames.length )];
			
		emojis[i] = {string: randomEmoji, reward: Math.floor(Math.random()*rewardMax)};
		returned = returned + (i+1) + ')' + emojis[i].string + ' ';
	}
	user.harvested = 1;
	user.harvestEmojis = emojis;
	return returned;		
}

exports.mushiesWork = function(user, bank){
	var amount = Math.ceil(Math.random() * config.workMax);
	if(bank.canWorkTimeLeft(user)<0){
		bank.mushiesAddEveryone(amount*config.percentage);
		bank.addBalanceUser(amount - amount*config.percentage);
		bank.addTotalWorkedUser(user, amount);
		bank.setWorkTimerUser(user, config.workDelay);
		
		return(config.fullCommunism + ' ' + user.username + " good job, you've receieved " + amount + config.currency + "! Everyone else has recieved " + amount*config.percentage + config.currency + " You can work again in " + config.workDelay/60000 + " minutes.");
		
	}else{
		return(user.username + " slow down comrade, you'll exhaust yourself! You can work again in " + bank.canWorkTimeLeft(user)/60000 + " minutes.");
	}
	
};

exports.topWorkers = function(bank, amount){
	amount = Math.min(20, amount, bank.getBank().length); //max size of 10, and not bigger than the amount of people
	var returned = [];
	var array = [];
	
	for(i = 0; i < bank.getBank().length; i++){
		array.push(bank.getBank()[i]);
	}
	
	function compare(a, b){
		return b.totalWorked - a.totalWorked;
	}
	array.sort(compare);
	
	for(i = 0; i < amount; i++){
		returned[i] = array[i];
	}
	return returned;
};

exports.laziestWorkers = function(bank, amount){
	amount = Math.min(20, amount, bank.getBank().length); //max size of 10, and not bigger than the amount of people
	var returned = [];
	var array = [];
	
	for(i = 0; i < bank.getBank().length; i++){
		array.push(bank.getBank()[i]);
	}
	
	function compare(a, b){
		return a.totalWorked - b.totalWorked;
	}
	array.sort(compare);
	
	for(i = 0; i < amount; i++){
		returned[i] = array[i];
	}
	return returned;
};

exports.harvest = function(user, bank, choice){	
	if(bank.canWorkTimeLeft(user) > 0){
		return(user.username + " slow down comrade, you'll exhaust yourself! You can work again in " + bank.canWorkTimeLeft(user)/60000 + " minutes.");
	}
	
	if(user.harvested){
		
		if(choice < user.harvestEmojis.length && choice>=0){
			var reward = user.harvestEmojis[choice].reward;
			var returned = '';
			
			worked(user, bank, reward, config.percentage, config.harvestDelay);
			
			for(i = 0; i < user.harvestEmojis.length; i++){
				if(choice == i){
					returned +='__**' + user.harvestEmojis[i].reward + '**__' + user.harvestEmojis[i].string + "  ";
				}else{
					returned +='`' + user.harvestEmojis[i].reward + '`' + user.harvestEmojis[i].string + "  ";
				}
			}
			
			returned += '\n' + config.fullCommunism + ' ' + user.username + " wow, that one had " + reward + config.currency + "! Good choice, comrade. Everyone else gained " + reward*config.percentage + config.currency + " You can work again in " + config.harvestDelay/60000 + " minutes.";
			
			user.harvested = 0;
			return returned;
		}else return("pick better...");
		
	}else{
		return newHarvest(user, config.harvestChoices, config.harvestMax);
	}
	
};

		