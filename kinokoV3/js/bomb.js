var config = require('../json/config.json');


var bomb = {alive:0, price: 0, explodeTime: 0, multiplier: 0};
var initPrice = 10;
var mult = 1.25;
var initTimer = 1000*60*60*12
function createBomb(price, timer, multiplier){
	var d = new Date();

	bomb.price = price;
	bomb.explodeTime = d.getTime() + timer;
	bomb.multiplier = multiplier;
	bomb.alive = 1;
}

function checkBomb(){
	var d = new Date();

	if(bomb.explodeTime < d.getTime()){
		bomb.alive = 0;
	}
}

exports.printBomb = function(){
	var d = new Date();
	checkBomb();
	if(!bomb.owner){
		var owner = "Nobody!";
	}else{
		var owner = bomb.owner.username;
	}
	if(bomb.alive){
		return(":bomb: The bomb is currently active. Minutes until explosion: " + ( ( bomb.explodeTime - d.getTime() ) / 60000 ) + "\n Owner: " + owner + "\n Price: " + bomb.price);
	}else{
		return(":bomb: The bomb has exploded. Its last owner was: " + owner + ". It exploded with a price of " + bomb.price + ". Buy a new one for " + initPrice + config.currency);
	}
}

exports.buyBomb = function(bank, newOwner){
	if(bomb.alive){
		var oldOwner = bomb.owner;
		if(bank.getBalanceUser(newOwner) >= bomb.price){
			if(bank.sendMushies(newOwner, oldOwner, bomb.price)){
				bomb.owner = newOwner;
				var oldPrice = bomb.price;
				bomb.price *= bomb.multiplier;
				return(":bomb: You bought the bomb from " + oldOwner.username + " for " + oldPrice + config.currency + "! It now costs " + bomb.price + config.currency);
			}else return ":bomb: something went wrong";
		}else return ":bomb: Broke ass nibba";
	}else{
		if(bank.getBalanceUser(newOwner) >= initPrice){
			createBomb(initPrice, initTimer, mult);
			bomb.owner = newOwner;
			bank.subtractBalanceUser(initPrice);
			bomb.price *= bomb.multiplier;
			return(":bomb: You bought the bomb for " + initPrice + config.currency + "! It now costs " + bomb.price + config.currency);
		}else return ":bomb: Haha you're poor.";
	}
}