var config = require('../json/config.json');
var bank = require('./bank.js');




exports.Ceelo = function(chan, currency){
	this.chan = chan;
	this.currency = currency.name;
	this.chip = currency.emoji;
	
	this.msgPrefix = "Cee-Lo: ";
	
	this.players = [];
	this.needRoll = [];
	this.needBet = [];
	this.rolled = [];
	
	this.state = 'idle';
	this.minBet = 10;
	this.minStack = 100;
	
	
};



exports.Ceelo.prototype.join = function(user, stack){
	
	if(this.players.includes(user)){
		
        this.chan.send(this.msgPrefix + user + " You are already in the game!");
		return false;
		
    }
	
	user.ceelo = { stack: 0, bet: 0, roll: [], rollScore: 0, numRolls: 0, rollString: '' }
	
	if(this.addStack(user, stack)){
		var numPlayers = this.players.push(user);
	}else{
		this.chan.send(this.msgPrefix + user + " that amount isn't valid. The minimum stack to bring is " + this.minStack + this.chip);
		return false;
	}
	
	if(this.state == 'idle'){
		
		this.chan.send(this.msgPrefix + user.username + " has joined cee-lo with a stack of " + stack + this.chip);
		
		if(numPlayers >= 2){
			this.ready();
		}
		return;
		
	}
	
	if(this.state == 'ready'){
		this.chan.send(this.msgPrefix + user.username + " has joined cee-lo with a stack of " + stack + this.chip);
	}
	
	if(this.state == 'betting' || this.state == 'rolling'){
		this.chan.send(this.msgPrefix + user.username + " has joined cee-lo with a stack of " + stack + this.chip + ". They can play in the next round.");
	}
	
};

	

exports.Ceelo.prototype.quit = function(user){
	
	this.quitGame = function(){
		user.ceelo.bet = 0;
		
		this.chan.send(this.msgPrefix + user.username + " You have left the game and withdrawed your stack of " + user.ceelo.stack + this.chip);
		this.withdrawStack(user);
		this.players.splice( this.players.indexOf(user), 1);
		
		if(this.needBet.includes(user)){
			this.needBet.splice( this.needBet.indexOf(user), 1);
		}
		
		if(this.needRoll.includes(user)){
			this.needRoll.splice( this.needRoll.indexOf(user), 1);
		}
	};
	
	if(!this.players.includes(user)){
		this.chan.send(this.msgPrefix + user + " You are not in the game.");
		return false;
	}
	
	if(this.state == 'idle'){
		this.quitGame();
	}
	
	if(this.state == 'ready'){
		this.quitGame();
		
		if(this.players.length <= 1){
			this.idle();
		}
	}
	
	if(this.state == 'betting'){
		if(user.ceelo.bet == 0){
			this.quitGame();
		}else if(this.players.length == 1){
			this.quitGame();
			this.idle();
		}else{
			this.chan.send(this.msgPrefix + user + " Please wait until your bet is done to quit!");
		}
	}
	
	if(this.state == 'rolling'){
		this.chan.send(this.msgPrefix + user + " Please wait until your bet is done to quit!");
	}
	
};

exports.Ceelo.prototype.makeBet = function(user, amount){

	
	this.setBet = function(){
		if(amount < this.minBet){
			this.chan.send(this.msgPrefix + user + " The minimum bet is " + this.minBet + this.chip);
			return false;
		}
		
		if(user.ceelo.stack >= amount * 2){
			if(this.state == 'ready'){
				this.betting();
			}
			user.ceelo.bet = amount;
			this.chan.send(this.msgPrefix + user.username + " Has placed a bet of " + amount + this.chip);
			return true;
		}else{
			this.chan.send(this.msgPrefix + user + " You need at least 2x your bet in your stack in case you have to pay double.");
			return false;
		}
	};
	
	if(this.state == 'idle'){
		this.chan.send(this.msgPrefix + user + " Need at least 2 people to start a game.");
	}
	
	if(this.state == 'ready'){
		
		if(this.setBet()){
			this.needBet.splice(this.needBet.indexOf(user), 1);
			this.needRoll.push(user);
			return;
		}
		
	}
	
	if(this.state == 'betting'){
		if(this.needBet.includes(user)){
			if(this.setBet()){
				this.needBet.splice(this.needBet.indexOf(user), 1);
				this.needRoll.push(user);
				if(this.needBet.length == 0){
					this.rolling();
					return;
				}
				
			}
		}
	}
	
	if(this.state == 'rolling'){
		this.chan.send(this.msgPrefix + user + " Wait until the next round to bet, we are waiting on people to roll.");
	}
	
};

exports.Ceelo.prototype.makeRoll = function(user){
	
	this.calcScore = function(dice){
		if(dice[0] == dice[1] && dice[0] == dice[2]) return(dice[0]*10);
		
		if(dice[0] == dice[1]) return dice[2];
		if(dice[0] == dice[2]) return dice[1];
		if(dice[1] == dice[2]) return dice[0];
		
		if(dice.includes(4) && dice.includes(5) && dice.includes(6)) return 100;
		if(dice.includes(1) && dice.includes(2) && dice.includes(3)) return -1;
		
		return 0;
	}
	
	this.newRoll = function(){
		var roll = [Math.round( (Math.random() * 5) + 1), Math.round( (Math.random() * 5) + 1), Math.round( (Math.random() * 5) + 1)];
		return roll;
	}
	
	
	
	if(this.state == 'idle'){
		this.chan.send(this.msgPrefix + user.username + " a game has not started yet. Once there's 2+ people place your bets and then roll.");
		return;
	}
	
	if(this.state == 'ready'){
		this.chan.send(this.msgPrefix + user.username + " a game has not started yet. Once there's 2+ people place your bets and then roll.");
		return;

	}
	
	if(this.state == 'betting'){
		this.chan.send(this.msgPrefix + " we are waiting for " + this.needBet[0] + " to place a bet! Bet 0 if you want to skip.");
		return;
	}
	
	if(this.state == 'rolling'){
		
		if(this.needRoll[0] != user){
			this.chan.send(this.msgPrefix + user + " it's not your turn to roll. It is " + this.needRoll[0] + " 's turn to roll.");
			return;
		}
			
		user.ceelo.roll = this.newRoll();
		user.ceelo.rollScore = this.calcScore(user.ceelo.roll);
		user.ceelo.numRolls += 1;
		user.ceelo.rollStr = ` **${user.ceelo.roll[0]} ${user.ceelo.roll[1]} ${user.ceelo.roll[2]}**`;

		if(user.ceelo.rollScore === 0){

			if(user.ceelo.numRolls < 3){
				this.chan.send(this.msgPrefix + user.username + user.ceelo.rollStr + " Shucks. Roll again, you have " + (3 - user.ceelo.numRolls) + " rolls left.");
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
			this.chan.send(this.msgPrefix + this.needRoll[0] + " It is your turn to roll!");
		}else{
			this.payout();
		}
			
		
	}
	
};

exports.Ceelo.prototype.getStack = function(user){
	if(this.players.includes(user)){
		this.chan.send(user.username + " you have " + user.ceelo.stack + this.chip + " in your cee-lo stack.");
	}else{
		this.chan.send(user.username + " you are not in the game.");
	}
}

exports.Ceelo.prototype.addStack = function(user, stack){
	if(stack < this.minStack){
		return false;
	}
	
	if(this.currency == "mushrooms"){
		
		if(bank.subtractBalanceUser(user, stack) ){
			
			user.ceelo.stack = stack;
			
			return true;
		}
			
	}else if(bank.subtractItemUser(user, this.currency, stack)){
			
		user.ceelo.stack = stack;
			
		return true;
	}
	
	return false;
	
};

exports.Ceelo.prototype.withdrawStack = function(user){
	if(this.currency == "mushrooms"){
		
		bank.addBalanceUser(user, user.ceelo.stack)
			
		user.ceelo.stack = 0;
		return true;
			
	}else{
		bank.addItemUser(user, this.currency, user.ceelo.stack);
			
		user.ceelo.stack = 0;
		return true;
	}
	
	return false;
};

exports.Ceelo.prototype.idle = function(){
	this.needRoll = [];
	this.needBet = [];
	
	if(this.state == 'betting'){
		if(this.players.length == 1){
			this.players[0].ceelo.bet = 0;
			this.chan.send(this.msgPrefix + this.players[0] + " You're the only one left. Any bets have been moved to your stack. You have a stack of " + this.players[0].ceelo.stack + this.chip);
		}else if(this.players.length > 1){
			this.chan.send("wtf tell mees to fix his shit, it's idle and there's more than 1 person");
		}
	}
	
	this.state = 'idle';
};

exports.Ceelo.prototype.ready = function(){
	this.needRoll = [];
	this.needBet = [];
	this.rolled = [];
	
	
	if(this.players.length >= 2){
		this.state = 'ready';
		this.chan.send(this.msgPrefix + "We have enough players and are ready to start! Place a bet to start a round or wait for more people to join.");
	}
	
};

exports.Ceelo.prototype.betting = function(){
	if(this.state == 'ready'){
		this.state = 'betting';
		this.needBet = this.players.slice();
	}
	
	for(var i = 0; i < this.players.length; i++){
		this.players[i].ceelo.bet = 0;
		this.players[i].ceelo.roll = [];
		this.players[i].ceelo.rollScore = 0;
		this.players[i].ceelo.numRolls = 0;
	}

};

exports.Ceelo.prototype.rolling = function(){
	this.state = 'rolling';
	
	this.chan.send("All bets are placed! " + this.needRoll[0] + " it is your turn to roll!");


};

exports.Ceelo.prototype.payout = function(){
	var winner = false;
	var tied = '';
	var msg = "The game is over! ";
	
	this.rolled.sort( (a,b) => b.ceelo.rollScore - a.ceelo.rollScore);
	
	if(this.rolled[0].ceelo.rollScore > this.rolled[1].ceelo.rollScore){
		winner = this.rolled[0];
		console.log("rolled winner bet: " + this.rolled[0].ceelo.bet);
	}else{
		for(var i = 1; i < this.rolled.length; i++){
			if(this.rolled[i].ceelo.rollScore == this.rolled[0].ceelo.rollScore){
				this.needRoll.push(this.rolled[i]);
				this.rolled[i].ceelo.numRolls = 0;
				tied += (this.rolled[i].username + " and ");
			}else break;
		}
		this.chan.send("Looks like we have a tie between " + tied + "! The tied players will have to reroll to determine who wins! First one to roll is " + this.needRoll[0]);
		return;
	}
	
	if(winner != false){
		var mult = 1;
		var total = 0;
		var lowBet = 0;
		for(var i = 0; i < this.rolled.length; i++){
			
			if(this.rolled[i] == winner){
				continue;
			}
			
			lowBet = Math.min(this.rolled[i].ceelo.bet, winner.ceelo.bet);
			console.log("low bet: " + lowBet + "rolled bet: " + this.rolled[i].ceelo.bet + " winner bet: " + winner.ceelo.bet);
			if(winner.ceelo.rollScore >= 100 || this.rolled[i].ceelo.rollScore == -1){
				mult = 2;
				msg += (this.rolled[i].username + " lost double for a total of " + (lowBet * mult) + this.chip);
			}else{
				mult = 1;
				msg += (this.rolled[i].username + " lost " + lowBet + this.chip);
			}
			winner.ceelo.stack += (lowBet * mult);
			this.rolled[i].ceelo.stack -= (lowBet * mult);
			msg += (" they have " + this.rolled[i].ceelo.stack + this.chip + "left in their stack \n");
			total += (lowBet * mult);
		}
		msg += (winner + " You won " + total + this.chip + " and have " + winner.ceelo.stack + this.chip + " in your stack.");
		this.chan.send(msg);
		this.ready();
		return;
		
	}
	
};
