var config = require('../json/config.json');
var bank = require('./bank.js');

var allBonus = 0.25;
var kinokoID = '401684543326781440';


function flipCoin(){
		var flip = Math.random();
		var coin;
		
		if(flip>=0.5){ 
			coin = ['h',':clown: **HEADS**'];
		}else{
			coin = ['t',':bat: **TAILS**'];
			}
		return coin;
}

exports.betFlip = function(message, bank){
	var coin = flipCoin();
	
	var array = message.content.split(' ');
	if(array.length != 3) return;
	
	if(array[2] == 'h' || array[2] == 't'){
	   var choice = array[2];
	}else{return;}
	
	if(array[1] >= 0){
		var bet = Math.round(array[1]);
	}
	
	if(bank.getBalanceUser(message.author) >= bet){
		flipCountUp();
		if(choice == coin[0]){
			bank.addBalanceUser(message.author, bet);
			addFlipPayout(bet);
			return(coin[1] + " You won " + bet + config.currency + "!");
		}else{
			bank.subtractBalanceUser(message.author, bet);
			addFlipIncome(bet);
			return(coin[1] + " Aww, better luck next time! You lost a whole " + bet + config.currency);
		}
	}else{
		return("Nibba, you don't have that much!");
	}
	
};

exports.betFlipAll = function(message, bank){
	var coin = flipCoin();
	
	var array = message.content.split(' ');
	if(array.length != 3) return;
	
	if(array[2] == 'h' || array[2] == 't'){
	   var choice = array[2];
	}else{return;}
	
	var userBalance = bank.getBalanceUser(message.author);
	console.log("test");
	console.log(userBalance);
	
	if(userBalance > 0){
		flipCountUp();
		if(choice == coin[0]){
			addFlipPayout(userBalance + (userBalance*allBonus) );
			bank.addBalanceUser(message.author, userBalance+(userBalance*allBonus));
			return(coin[1] + " Wow! You went all in and won " + userBalance + config.currency + "! You also got an extra " + (allBonus*100) + "% bonus of " + (userBalance*allBonus) + config.currency);
		}else{
			addFlipIncome(userBalance);
			bank.subtractBalanceUser(message.author, userBalance);
			return(coin[1] + " You lost it all, loser. A whole " + userBalance + config.currency);
		}
	}else{
		return("Nibba, you don't have that much!");
	}
};

function addFlipPayout(amount){
	var kinoko = bank.bankFindByID(kinokoID);
	
	if(kinoko.hasOwnProperty('flipPayout')){
		kinoko.flipPayout += amount;
	}else{
		kinoko.flipPayout = amount;
	}
}

function addFlipIncome(amount){
	var kinoko = bank.bankFindByID(kinokoID);
	
	if(kinoko.hasOwnProperty('flipIncome')){
		kinoko.flipIncome += amount;
	}else{
		kinoko.flipIncome = amount;
	}
}

function flipCountUp(){
	var kinoko = bank.bankFindByID(kinokoID);
	
	if(kinoko.hasOwnProperty('flips')){
		kinoko.flips += 1;
	}else{
		kinoko.flips = 1;
	}
	
}

exports.getFlipStats = function(){
	var kinoko = bank.bankFindByID(kinokoID);
	
	return({ income: kinoko.flipIncome, payout: kinoko.flipPayout, profit: kinoko.flipIncome - kinoko.flipPayout, flips: kinoko.flips });
};
