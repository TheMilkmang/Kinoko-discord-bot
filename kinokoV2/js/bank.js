var bank = require('../json/bank.json');
var config = require('../json/config.json');
var save = require('./save.js');

exports.getBank = function(){
	return bank;
};

function bankFindByID(ID){
	for(var i = 0; i<bank.length; i++){
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
	worker.username = user.username;
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
	for(var i=0; i<bank.length; i++) {
		bank[i].balance += amount;
	}
	save.jsonSave(bank, 'bank.json');
};

exports.getPoorest = function(amount){
	amount = Math.min(20, amount, bank.length);
	var returned = [];
	var array = [];
	
	for(var i = 0; i < bank.length; i++){
		bank[i].balance = Math.round(bank[i].balance);
		array.push(bank[i]);
	}
	
	function compare(a, b){
		return a.balance - b.balance;
	}
	array.sort(compare);
	for(var i = 0; i < amount; i++){
		returned[i] = array[i];
	}
	return returned;
};

exports.getRichest = function(amount){
	amount = Math.min(20, amount, bank.length);
	var returned = [];
	var array = [];
	
	for(var i = 0; i < bank.length; i++){
		bank[i].balance = Math.round(bank[i].balance);
		array.push(bank[i]);
	}
	
	function compare(a, b){
		return b.balance - a.balance;
	}
	array.sort(compare);
	for(var i = 0; i < amount; i++){
		returned[i] = array[i];
	}
	return returned;
};

//inventory


function checkInvExists(user){
	var worker = bankFindByUser(user);
	
	if(!worker.hasOwnProperty('inventory')){
		worker.inventory = [];
	}
}

function invHasItem(user, item){
	var worker = bankFindByUser(user);
	
	checkInvExists(user);
	
	for(var i = 0; i < worker.inventory.length; i++){
		if(worker.inventory[i].name === item){
			return i;
		}
	}
	
	return -1;
	
}

exports.addItemUser = function(user, item, amount){
	var worker = bankFindByUser(user);
	var invIndex = invHasItem(user, item);
	amount = Math.floor(amount);
	
	if(invIndex >= 0){
		worker.inventory[invIndex].amount += amount;
	}else{
		var index = worker.inventory.length;
		worker.inventory[index] = {name: item, amount: amount};
	}
	
	save.jsonSave(bank, 'bank.json');
	
	return true;
};

exports.subtractItemUser = function(user, item, amount){
	var worker = bankFindByUser(user);
	var invIndex = invHasItem(user, item);
	amount = Math.floor(amount);
	
	if(invIndex >= 0){
		
		if(worker.inventory[invIndex].amount >= amount){
			worker.inventory[invIndex].amount -= amount;
			save.jsonSave(bank, 'bank.json');
			return true;
		}
		
	}
		
	return false;
};

exports.getItemBalanceUser = function(user, item){
	var worker = bankFindByUser(user);
	var invIndex = invHasItem(user, item);
	
	if(invIndex >= 0){
		return worker.inventory[invIndex].amount;
	}
	return 0;
};