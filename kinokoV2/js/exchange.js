var config = require('../json/config.json');
var exchange = require('../json/exchange.json');
var bank = require('./bank.js');
var save = require('./save.js');

var sellOrders = exchange.sellOrders;
var buyOrders = exchange.buyOrders;
var filledOrders = exchange.filledOrders;

exports.bot = {};

// {item: "Ujin Currency", quantity: 5, price: 10, userID: "15835380535", username: "username"}
function saveExchange(){
	exchange.sellOrders = sellOrders;
	exchange.buyOrders = buyOrders;
	exchange.filledOrders = filledOrders;
	
	save.jsonSave(exchange, 'exchange.json');
}

exports.createSellOrder = function(user, item, quantity, price){
	price = Math.floor(price);
	if(price <= 0) return false;
	
	quantity = Math.floor(quantity);
	if(quantity <= 0) return false;
	
	if(bank.getItemBalanceUser(user, item) < quantity) return false;
	
	bank.subtractItemUser(user, item, quantity);
	
	var index = sellOrders.push( {item: item, quantity: quantity, price: price, userID: user.id, username: user.username} ) - 1;
	checkSellOrder(index);
	saveExchange();
	return true;
};

function checkSellOrder(index){
	var quantity = sellOrders[index].quantity;
	
	
	if(buyOrders.length == 0){
		console.log("Sell order accepted. No buy orders. ");
		return;
	}
	
	for(var i = 0; i < buyOrders.length; i++){
		if(buyOrders[i].item != sellOrders[index].item) continue;
			
		if(buyOrders[i].price < sellOrders[index].price) continue;
				
		if(buyOrders[i].quantity == sellOrders[index].quantity){
			fillSellOrder(index, quantity);
			fillBuyOrder(i, quantity);
			
			console.log("both orders filled completely");
			return;
		}
		
		if(buyOrders[i].quantity > sellOrders[index].quantity){
			fillBuyOrder(i, quantity);
			fillSellOrder(index, quantity);
			
			console.log("sell order filled fully");
			return;
		}
		console.log("sell i is: " + i);
		if(buyOrders[i].quantity < sellOrders[index].quantity){
			var amount = buyOrders[i].quantity;
			fillSellOrder(index, amount);
			fillBuyOrder(i, amount);

			console.log("sell order filled partially. Continuing...");
			if(buyOrders.length == 0) return;
			checkSellOrder(index);
		}
		
	}
	
}

function recordOrder(order, amount, type){
	order.quantity = amount;
	order.type = type;
	filledOrders.unshift(order);
	saveExchange();
}

function fillSellOrder(index, quantity){
	console.log("Index: " + index);
	if(sellOrders.length == 0) return;
	if(index > sellOrders.length-1) return;
	console.log("Filling Sell Order " + index + " quantity: " + quantity);
	var user = exports.bot.users.get(sellOrders[index].userID);
	var price = sellOrders[index].price;
	var total = price*quantity;
	
	bank.addBalanceUser(user, total);
	
	recordOrder(sellOrders[index], quantity, "sell");
	sellOrders[index].quantity -= quantity;
	
	if(sellOrders[index].quantity <= 0){
		console.log("sell order <= 0");
		sellOrders.splice(index, 1);
	}
	
}

function fillBuyOrder(index, quantity){
	if(buyOrders.length == 0) return;
	if(index > buyOrders.length-1) return;
	
	var user = exports.bot.users.get(buyOrders[index].userID);
	
	bank.addItemUser(user, buyOrders[index].item, quantity);
	
	recordOrder(buyOrders[index], quantity, "buy");
	buyOrders[index].quantity -= quantity;
	if(buyOrders[index].quantity <= 0){
		buyOrders.splice(index, 1);
	}
}

exports.createBuyOrder = function(user, item, quantity, price){
	price = Math.floor(price);
	if(price <= 0) return false;
	
	quantity = Math.floor(quantity);
	if(quantity <= 0) return false;
	
	var total = price*quantity;
	
	if(!bank.subtractBalanceUser(user, total)) return false;
	
	var index = buyOrders.push( {item: item, quantity: quantity, price: price, userID: user.id, username: user.username} ) - 1;
	checkBuyOrder(index);
	saveExchange();
	return true;
}

function checkBuyOrder(index){
	var quantity = buyOrders[index].quantity;
	
	
	if(sellOrders.length === 0){
		console.log("Buy order accepted. No sell orders. ");
		return;
	}
	
	for(var i = 0; i < sellOrders.length; i++){
		if(buyOrders[index].item != sellOrders[i].item) continue;
			
		if(buyOrders[index].price < sellOrders[i].price) continue;
				
		if(buyOrders[index].quantity == sellOrders[i].quantity){
			fillSellOrder(i, quantity);
			fillBuyOrder(index, quantity);
			
			console.log("both orders filled completely");
			return;
		}
		
		if(buyOrders[index].quantity < sellOrders[i].quantity){
			fillSellOrder(i, quantity);
			fillBuyOrder(index, quantity);
			
			console.log("buy order filled fully");
			return;
		}
		console.log("buy i is: " + i);
		if(buyOrders[index].quantity > sellOrders[i].quantity){
			var amount = sellOrders[i].quantity;
			fillBuyOrder(index, amount);
			console.log("giving sellOrder Index of: " + i);
			fillSellOrder(i, amount);

			console.log("buy order filled partially. Continuing...");
			checkBuyOrder(index);
		}
		
	}
}


exports.getSellOrders = function(start, amount){
	var returned = "**Sell Orders:** ";
	amount = Math.min(amount, sellOrders.length);
	start = Math.min(start, sellOrders.length-1);

	if(sellOrders.length == 0) return(returned);
	
	for(var i = start; i < amount; i++){
		returned = returned + "\n Item: " + sellOrders[i].item + "    Quantity: " + sellOrders[i].quantity + "    Price Each: " + sellOrders[i].price + config.currency + "    " + sellOrders[i].username;
	}
	
	return(returned);
};

exports.getBuyOrders = function(start, amount){
	var returned = "**Buy Orders:** ";
	amount = Math.min(amount, buyOrders.length);
	start = Math.min(start, buyOrders.length-1);

	if(buyOrders.length == 0) return(returned);
	
	for(var i = start; i < amount; i++){
		returned = returned + "\n Item: " + buyOrders[i].item + "    Quantity: " + buyOrders[i].quantity + "    Price Each: " + buyOrders[i].price + config.currency + "    " + buyOrders[i].username;
	}
	
	return(returned);
};

