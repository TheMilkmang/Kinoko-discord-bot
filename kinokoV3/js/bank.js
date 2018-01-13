var bank = require('../json/bank.json');
var config = require('../json/config.json');
var save = require('./save.js');

exports.getBank = function(){
	return bank;
};

function bankFindByID(ID){
	for(i = 0; i<bank.length; i++){
		if(bank[i].id === ID){
			return bank[i];
		}
	}
	return -1;
}

function bankFindByUser(user){
	var worker = bankFindByID(user.id);
	if(worker != -1){
		return worker;
	}else{
		worker = createWorker(user);
		return worker;
	}
		
}

function createWorker(user){
	var index = bank.push( {id: user.id, name: user.username, balance: 100, totalWorked: 0, workTimer: 0}) - 1 ;
	save.jsonSave(bank, 'bank.json');
	return bank[index];
}

exports.addBalanceUser = function(user, amount){
	var worker = bankFindByUser(user);
	amount = Math.round(amount);
	
	worker.balance += amount;
	save.jsonSave(bank, 'bank.json');
	
	return true;
};

exports.subtractBalanceUser = function(user, amount){
	var worker = bankFindByUser(user);
	amount = Math.round(amount);
	
	if(worker.balance >= amount){
		worker.balance -= amount;
		save.jsonSave(bank, 'bank.json');
		return true;
	}else{
		return false;
	}
};

exports.getBankWorker = function(user){
	return bankFindByUser(user);
};

exports.getPopulation = function(){
	return bank.length;
};

exports.getBalanceUser = function(user){
	var worker = bankFindByUser(user);
	worker.balance = Math.round(worker.balance);
	return worker.balance;
};

exports.getTotalWorkedUser = function(user){
	var worker = bankFindByUser(user);
	return(worker.totalWorked);
};

exports.addTotalWorkedUser = function(user, amount){
	var worker = bankFindByUser(user);
	amount = Math.round(amount);
	
	worker.totalWorked += amount;
	return worker.totalWorked;

};

exports.canWorkTimeLeft = function(user){
	var d = new Date();
	var ms = d.getTime();
	
	var worker = bankFindByUser(user);
	return worker.workTimer - ms;
};
	
exports.setWorkTimerUser = function(user, delay){
	delay = Math.round(delay);
	var d = new Date();
	var ms = d.getTime();
	var worker = bankFindByUser(user);

	worker.workTimer = ms + delay;
	return true;
};

exports.sendMushies = function(fromUser, toUser, amount){
	amount = Math.round(amount);
	
	if(amount > 0){
		if(exports.subtractBalanceUser(fromUser, amount)){
			if(exports.addBalanceUser(toUser, amount)) return true;
		}else return -1;
	}
};

exports.mushiesAddEveryone = function(amount){
	for(i=0; i<bank.length; i++) {
		bank[i].balance += amount;
	}
	save.jsonSave(bank, 'bank.json');
};

exports.getPoorest = function(amount){
	amount = Math.min(20, amount, bank.length);
	var returned = [];
	var array = [];
	
	for(i = 0; i < bank.length; i++){
		bank[i].balance = Math.round(bank[i].balance);
		array.push(bank[i]);
	}
	
	function compare(a, b){
		return a.balance - b.balance;
	}
	array.sort(compare);
	for(i = 0; i < amount; i++){
		returned[i] = array[i];
	}
	return returned;
};

exports.getRichest = function(amount){
	amount = Math.min(20, amount, bank.length);
	var returned = [];
	var array = [];
	
	for(i = 0; i < bank.length; i++){
		bank[i].balance = Math.round(bank[i].balance);
		array.push(bank[i]);
	}
	
	function compare(a, b){
		return b.balance - a.balance;
	}
	array.sort(compare);
	for(i = 0; i < amount; i++){
		returned[i] = array[i];
	}
	return returned;
};
