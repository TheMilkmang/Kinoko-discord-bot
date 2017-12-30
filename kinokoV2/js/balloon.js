var config = require('../json/config.json');

var initPrice = 100;
var initTimer = 1000*60*60;

var balloon = {alive:0, price: initPrice, explodeTime: 0, prize: 0};

function createBalloon(bank, channel, price, timer){
	var d = new Date();

	balloon.price = price;
	balloon.explodeTime = d.getTime() + timer;
	balloon.alive = 1;
	balloon.prize = price + 100;
	
	setTimeout(pop, timer, bank, channel);
}

function pop(bank, channel){
	balloon.alive = 0;
	
	if(balloon.owner){
		bank.addBalanceUser(balloon.owner, balloon.prize);
		channel.send(":balloon: The balloon popped! " + balloon.owner + " won " + balloon.prize + config.currency + "!"); 
	}
}

function checkBalloon(bank){
	var d = new Date();
	if(!balloon.alive) return;
	
	if(balloon.explodeTime < d.getTime()){
		balloon.alive = 0;
		if(balloon.owner){
			bank.addBalanceUser(balloon.owner, balloon.prize);
		}
	}
}

exports.printBalloon = function(bank){
	var d = new Date();
	
	if(!balloon.owner){
		var owner = "Nobody!";
	}else{
		var owner = balloon.owner.username;
	}
	if(balloon.alive){
		return(":balloon: The balloon is currently active. Be the last one to own it before it pops and you win the prize! Minutes until it pops: " + ( ( balloon.explodeTime - d.getTime() ) / 60000 ) + "\n Owner: " + owner + "\n Price: " + balloon.price + "\n Prize: " + balloon.prize + config.currency);
	}else{
		return(":balloon: :boom: The balloon has popped. Its last owner " + owner + " receieved a prize of " + balloon.prize + ". Buy a new one for " + initPrice + config.currency);
	}
}

exports.buyBalloon = function(bank, channel, newOwner){
	if(balloon.alive){
		if(bank.getBalanceUser(newOwner) >= balloon.price){
			bank.subtractBalanceUser(newOwner, balloon.price);
			balloon.owner = newOwner;
			balloon.prize += balloon.price;
			return(":balloon: You bought the balloon for " + balloon.price + config.currency + "! The prize is now " + balloon.prize + config.currency);
		}else return ":balloon: Broke ass nibba";
	}else{
		if(bank.getBalanceUser(newOwner) >= initPrice){
			createBalloon(bank, channel, initPrice, initTimer);
			balloon.owner = newOwner;
			bank.subtractBalanceUser(newOwner, initPrice);
			return(":balloon: You bought the balloon for " + initPrice + config.currency + "! The prize is now " + balloon.prize + config.currency + ". If you're the last one holding the balloon before it pops then you win the prize pool! The balloon will pop in " + (initTimer / 60000) + " minutes.");
		}else return ":balloon: Haha you're poor.";
	}
}
