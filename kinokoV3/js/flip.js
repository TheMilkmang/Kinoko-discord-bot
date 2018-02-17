var config = require('../json/config.json');

var allBonus = 0.25;

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
		if(choice == coin[0]){
			bank.addBalanceUser(message.author, bet);
			bank.addFlipPayout(bet);
			return(coin[1] + " You won " + bet + config.currency + "!");
		}else{
			bank.subtractBalanceUser(message.author, bet);
			bank.addFlipIncome(bet);
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
		if(choice == coin[0]){
			bank.addFlipPayout(userBalance + (userBalance*allBonus) );
			bank.addBalanceUser(message.author, userBalance+(userBalance*allBonus));
			return(coin[1] + " Wow! You went all in and won " + userBalance + config.currency + "! You also got an extra " + (allBonus*100) + "% bonus of " + (userBalance*allBonus) + config.currency);
		}else{
			bank.addFlipIncome(userBalance);
			bank.subtractBalanceUser(message.author, userBalance);
			return(coin[1] + " You lost it all, loser. A whole " + userBalance + config.currency);
		}
	}else{
		return("Nibba, you don't have that much!");
	}
};
