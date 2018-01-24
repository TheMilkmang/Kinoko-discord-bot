var config = require('../json/config.json');

var allBonus = 0.25;

exports.betFlip = function(message, bank){
	var flip = Math.random();
	if(flip>=0.5){ 
		flip = 'h';
		var coin = ':clown: **HEADS**';
	}else{
		flip = 't';
		var coin = ':bat: **TAILS**';
	}
	
	var array = message.content.split(' ');
	if(array.length != 3) return;
	
	if(array[2] == 'h' || array[2] == 't'){
	   var choice = array[2];
	}else{return;}
	
	if(array[1] >= 0){
		var bet = Math.round(array[1]);
	}
	
	if(bank.getBalanceUser(message.author) >= bet){
		if(choice == flip){
			bank.addBalanceUser(message.author, bet);
			return(coin + " You won " + bet + config.currency + "!");
		}else{
			bank.subtractBalanceUser(message.author, bet);
			return(coin + " Aww, better luck next time! You lost a whole " + bet + config.currency);
		}
	}else{
		return("Nibba, you don't have that much!");
	}
	
};

exports.betFlipAll = function(message, bank){
	var flip = Math.random();
	if(flip>=0.5){ 
		flip = 'h';
		var coin = ':clown: **HEADS**';
	}else{
		flip = 't';
		var coin = ':bat: **TAILS**';
	}
	
	var array = message.content.split(' ');
	if(array.length != 3) return;
	
	if(array[2] == 'h' || array[2] == 't'){
	   var choice = array[2];
	}else{return;}
	
	var userBalance = bank.getBalanceUser(message.author);
	console.log("test");
	console.log(userBalance);
	
	if(userBalance > 0){
		if(choice == flip){
			bank.addBalanceUser(message.author, userBalance+(userBalance*allBonus));
			return(coin + " Wow! You went all in and won " + userBalance + config.currency + "! You also got an extra " + (allBonus*100) + "% bonus of " + (userBalance*allBonus) + config.currency);
		}else{
			bank.subtractBalanceUser(message.author, userBalance);
			return(coin + " You lost it all, loser. A whole " + userBalance + config.currency);
		}
	}else{
		return("Nibba, you don't have that much!");
	}
};
