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
	var d = new Date();
	var timeLeft = balloon.explodeTime - d.getTime();
	if(timeLeft > 0){
		setTimeout(pop, timeLeft, bank, channel);
		return false;
	}
	balloon.alive = 0;
	
	if(balloon.owner){
		bank.addBalanceUser(balloon.owner, balloon.prize);
		channel.send(":balloon: The balloon popped! " + balloon.owner + " won " + balloon.prize + config.currency + "!"); 
	}
	return true;
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
	var d = new Date();
	
	if(balloon.alive){
		if(balloon.owner == newOwner){
			return(":balloon: You already own the balloon nibba");
		}
		
		if(bank.getBalanceUser(newOwner) >= balloon.price){
			bank.subtractBalanceUser(newOwner, balloon.price);
			var oldOwner = balloon.owner;
			balloon.owner = newOwner;
			balloon.prize += balloon.price;
			balloon.explodeTime += 60000;
			return(":balloon: " + oldOwner + " The balloon was bought from you by " + newOwner.username + "! The prize is now " + balloon.prize + config.currency + " And one minute has been added to the timer! It pops in this many minutes: " + ((balloon.explodeTime - d.getTime() ) / 60000));
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
