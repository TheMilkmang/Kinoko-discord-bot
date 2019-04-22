var config = require('../json/config.json');
var bank = require('./bank.js');

var kinokoID = '401684543326781440';


exports.Ceelo = function(chan, currency, minBet){
	this.chan = chan;
	this.currency = currency.name;
	this.chip = currency.emoji;
	
	this.msgPrefix = "Cee-Lo: ";
	
	this.players = [];
	this.needRoll = [];
	this.rolled = [];
	
	this.state = 'idle';  //idle, betting, rolling
	this.minBet = minBet;
	
	this.roundPot = 0;
	
	this.betTimeout = -1;
	this.rollTimeout = -1;
	
};

exports.Ceelo.prototype.setBet = function(user, amount){
	if(amount < this.minBet){
		this.chan.send(this.msgPrefix + user + " The minimum bet is " + this.minBet + this.chip);
		return false;
	}

	if(bank.getItemBalanceUser(user, this.currency) >= amount * 2){
		
		user.ceelo = { bet: amount, collateral: amount*2, roll: [], rollScore: 0, numRolls: 0, rollString: '' }
		bank.subtractItemUser(user, this.currency, amount*2);
		
		this.players.push(user);
		this.needRoll.push(user);
		this.chan.send(this.msgPrefix + user.username + " Has placed a bet of " + amount + this.chip);
		
		return true;
	}else{
		this.chan.send(this.msgPrefix + user + " You need at least 2x your bet in your balance in case you have to pay double.");
		return false;
	}
};
exports.Ceelo.prototype.makeBet = function(user, amount){
	
	if(this.players.includes(user)){
		this.chan.send(this.msgPrefix + user + " you have already placed a bet of " + user.ceelo.bet + this.chip);
		return;
	}
	
	if(this.state == 'idle'){
		if(this.setBet(user, amount)){
			var self = this;
			this.betTimeout = setTimeout(function() { self.rolling() }, 15000);
			this.chan.send(this.msgPrefix + "Place your bets everyone! Rolling will begin in 15 seconds. Use c]force to start immediately");
			this.betting();
			return;
		}
	}
	
	if(this.state == 'betting'){
		this.setBet(user, amount);
	}
	
	if(this.state == 'rolling'){
		this.chan.send(this.msgPrefix + user + " Wait until the next round to bet, we are waiting on people to roll.");
		return;
	}
	
};


exports.Ceelo.prototype.calcScore = function(dice){
	if(dice[0] == dice[1] && dice[0] == dice[2]) return(dice[0]*10);
		
	if(dice[0] == dice[1]) return dice[2];
	if(dice[0] == dice[2]) return dice[1];
	if(dice[1] == dice[2]) return dice[0];

	if(dice.includes(4) && dice.includes(5) && dice.includes(6)) return 100;
	if(dice.includes(1) && dice.includes(2) && dice.includes(3)) return -1;

	return 0;
};

exports.Ceelo.prototype.newRoll = function(){
	var roll = [Math.round( (Math.random() * 5) + 1), Math.round( (Math.random() * 5) + 1), Math.round( (Math.random() * 5) + 1)];
	return roll;
};

exports.Ceelo.prototype.makeRoll = function(user){
	
	if(this.state == 'idle'){
		this.chan.send(this.msgPrefix + user.username + " Make a bet and then wait for it to be time to roll!");
		return;
	}
	
	if(this.state == 'betting'){
		this.chan.send(this.msgPrefix + user.username + " It is not yet time to roll. Wait or do c]force to start!");
		return;
	}
	
	if(this.state == 'rolling'){
		
		if(this.needRoll[0] != user){
			this.chan.send(this.msgPrefix + user + " it's not your turn to roll. It is " + this.needRoll[0] + " 's turn to roll.");
			return;
		}
		clearTimeout(this.rollTimeout);
		user.ceelo.roll = this.newRoll();
		user.ceelo.rollScore = this.calcScore(user.ceelo.roll);
		user.ceelo.numRolls += 1;
		user.ceelo.rollStr = ` **${user.ceelo.roll[0]} ${user.ceelo.roll[1]} ${user.ceelo.roll[2]}**`;

		if(user.ceelo.rollScore === 0){

			if(user.ceelo.numRolls < 3){
				this.chan.send(this.msgPrefix + user.username + user.ceelo.rollStr + " Shucks. Roll again, you have " + (3 - user.ceelo.numRolls) + " rolls left.");
				var self = this;
				this.rollTimeout = setTimeout( function(){ self.makeRoll( self.needRoll[0] ) }, 30000);
				return;
			}else{
				this.chan.send(this.msgPrefix + user.username + user.ceelo.rollStr + " Wow, that was your last roll and you got nothing." );

			}

		}else{
			this.chan.send(this.msgPrefix + user.username + " rolls" + user.ceelo.rollStr);
		}

		this.needRoll.shift();
		this.rolled.push(user);

		if(this.needRoll.length){
			this.chan.send(this.msgPrefix + this.needRoll[0] + " It is your turn to roll! If you don't roll within 30 seconds, then it will be done automatically.");
			var self = this;
			this.rollTimeout = setTimeout( function(){ self.makeRoll( self.needRoll[0] ) }, 30000);
		}else{
			this.payout();
		}
			
		
	}
	
};

exports.Ceelo.prototype.idle = function(){
	this.needRoll = [];
	this.rolled = [];
	this.players = [];
	
	this.state = 'idle';
};

exports.Ceelo.prototype.betting = function(){
	this.state = 'betting';

};

exports.Ceelo.prototype.rolling = function(){
	if(this.players.length == 1){
		this.chan.send(this.msgPrefix + this.players[0] + " No one  bet against you. Your bet has been returned!");
		bank.addItemUser(this.players[0], this.currency, this.players[0].ceelo.collateral);
		this.players[0].ceelo.collateral = 0;
		clearTimeout(this.rollTimeout);
		this.idle();
		return;
	}else{
		this.chan.send(this.msgPrefix + "All bets are placed! " + this.needRoll[0] + " it is your turn to roll! If you don't roll within 30 seconds then it will be done automatically.");
		this.state = 'rolling';
	}
	
	var self = this;
	this.rollTimeout = setTimeout(  function(){  self.makeRoll( self.needRoll[0] ) }, 30000);
	
};

exports.Ceelo.prototype.payout = function(){
	var winner = false;
	var tiedStr = '';
	var msg = "The game is over! ";
	var loseMsg = " These players lost: ";
	var tiedPlayers = [];
	var losers = [];
	var mult = 1;
	var tiedBetsTotal = 0;
	
	this.rolled.sort( (a,b) => b.ceelo.rollScore - a.ceelo.rollScore);
	
	if(this.rolled[0].ceelo.rollScore > this.rolled[1].ceelo.rollScore){
		winner = this.rolled[0];
	}else{
		if(this.rolled[0].rollScore >= 100){
			mult = 2;
		}
		
		for(var i = 0; i < this.rolled.length; i++){
			if(this.rolled[i].ceelo.rollScore == this.rolled[0].ceelo.rollScore){
				tiedPlayers.push(this.rolled[i]);
				tiedStr += (" and " + this.rolled[i].username);
				tiedBetsTotal += this.rolled[i].ceelo.bet;
			}else{
				losers.push(this.rolled[i]);
			}
		}
		this.rolled = [];
		
		for(var i = 0; i < tiedPlayers.length; i++){
			this.needRoll.push(tiedPlayers[i]);
			tiedPlayers[i].ceelo.numRolls = 0;
			tiedPlayers[i].ceelo.rollScore = 0;
			tiedPlayers[i].ceelo.roll = [];
			tiedPlayers[i].ceelo.rollString = '';
		}
		
		for(var i = 0; i < losers.length; i++){
			if(mult == 2 || losers[i].ceelo.rollScore == -1){
				var amt = Math.min(tiedBetsTotal, losers[i].ceelo.bet*2);
				loseMsg += ( losers[i].username + ' lost double for a total of ' + amt + this.chip + ', ' );
			}else{
				var amt = Math.min(tiedBetsTotal, losers[i].ceelo.bet);
				loseMsg += ( losers[i].username + ' lost ' + amt + this.chip + ', ');
			}
			losers[i].ceelo.bet = 0;
			losers[i].ceelo.collateral -= amt;
			this.roundPot += amt;
			
			if(losers[i].ceelo.collateral >= 1){
				bank.addItemUser(losers[i], this.currency, losers[i].ceelo.collateral);
			}

		}
		this.chan.send("Looks like we have a tie between " + tiedStr + "! " + loseMsg + " The extra pot for the tied players is at " + this.roundPot + " The tied players will have to reroll to determine who wins! First one to roll is " + this.needRoll[0]);
		return;
	}
	
	if(winner != false){
		mult = 1;
		var total = 0;
		var lowBet = 0;
		for(var i = 0; i < this.rolled.length; i++){
			
			if(this.rolled[i] == winner){
				continue;
			}
			
			lowBet = Math.min(this.rolled[i].ceelo.bet, winner.ceelo.bet);
			if(winner.ceelo.rollScore >= 100 || this.rolled[i].ceelo.rollScore == -1){
				mult = 2;
				msg += (this.rolled[i].username + " lost double for a total of " + (lowBet * mult) + this.chip);
				this.rolled[i].ceelo.collateral -= (lowBet * mult);
			}else{
				mult = 1;
				msg += (this.rolled[i].username + " lost " + lowBet + this.chip);
				this.rolled[i].ceelo.collateral -= lowBet;
			}
			bank.addItemUser(this.rolled[i], this.currency, this.rolled[i].ceelo.collateral);
			msg += (" they now have " + bank.getItemBalanceUser(this.rolled[i], this.currency).toLocaleString() + this.chip);
			total += (lowBet * mult);
		}
		if(this.roundPot > 0){
			msg += ("The extra pot from ties was: " + this.roundPot + this.chip);
			total += this.roundPot;
			bank.addItemUser(winner,  this.currency, this.roundPot);
		}
		var rake = Math.floor(total * 0.01) + 1;
		this.addStats(rake, total);
		total -= rake;
		bank.addItemUser(winner, this.currency, total + winner.ceelo.collateral);
		winner.ceelo.collateral = 0;
		msg += (winner + " You won " + total + this.chip + " and now have " + bank.getItemBalanceUser(winner, this.currency).toLocaleString() + this.chip + " in your stack. Bank of Kinoko took a 1 + 1% rake of: " + rake);
		this.chan.send(msg);
		this.idle();
		return;
		
	}
	
};

exports.Ceelo.prototype.addStats = function(rake, total){
	var kinoko = bank.bankFindByID(kinokoID);
	if(this.currency == 'mushrooms'){
		if(kinoko.hasOwnProperty('ceeloMushroomStats')){
			kinoko.ceeloMushroomStats.rake += rake;
			kinoko.ceeloMushroomStats.total += total;
			kinoko.ceeloMushroomStats.games += 1;
		}else{
			kinoko.ceeloMushroomStats = { rake: rake, total: total, games: 1};
		}
		
	}else if(this.currency == 'Ujin Currency'){
		if(kinoko.hasOwnProperty('ceeloUjinStats')){
			kinoko.ceeloUjinStats.rake += rake;
			kinoko.ceeloUjinStats.total += total;
			kinoko.ceeloUjinStats.games += 1;
		}else{
			kinoko.ceeloUjinStats = { rake: rake, total: total, games: 1};
		}
	}
};

exports.Ceelo.prototype.getStats = function(){
	var kinoko = bank.bankFindByID(kinokoID);
	if(this.currency == 'mushrooms'){
		this.chan.send(this.msgPrefix + " Mushroom game stats. Games played: " + kinoko.ceeloMushroomStats.games + " Total Wagered: " + kinoko.ceeloMushroomStats.total + " Rake collected: " + kinoko.ceeloMushroomStats.rake);
	}else if( this.currency == 'Ujin Currency'){
		this.chan.send(this.msgPrefix + " Pretzel game stats. Games played: " + kinoko.ceeloUjinStats.games + " Total Wagered: " + kinoko.ceeloUjinStats.total + " Rake collected: " + kinoko.ceeloUjinStats.rake);
	}
};

