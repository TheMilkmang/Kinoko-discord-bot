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

function checkOrders(){
	
	if(sellOrders.length == 0 || buyOrders.length == 0){
		console.log("Buy or sell order length is 0");
		return;
	}
	
	for(var i = 0; i < sellOrders.length; i++){
		
		for(var j = 0; j < buyOrders.length; j++){
			var price;
			var quantity;
			
			if(sellOrders[i].item != buyOrders[j].item){
				console.log("Wrong item type " + sellOrders[i].item + ", " + buyOrders[j].item);
				
				continue;
			}
			
			if(sellOrders[i].price > buyOrders[j].price){
				console.log("Sell price higher than buy price, no deal.");
				
				continue;
			}
			
			if(sellOrders[i].quantity == buyOrders[j].quantity){
				
				console.log("Quantity matches exactly!\nsell: " + sellOrders[i] + "\nbuy: " + buyOrders[j]);
				
				price = sellOrders[i].price;
				quantity = sellOrders[i].quantity;
				
			}else if(sellOrders[i].quantity > buyOrders[j].quantity){
				
				console.log("More sell orders than buy.\nsell: " + sellOrders[i] + "\nbuy: " + buyOrders[j]);
				
				price = sellOrders[i].price;
				quantity = buyOrders[j].quantity;
				
			}else if(sellOrders[i].quantity < buyOrders[j].quantity){
				
				console.log("More buy orders than sell.\nsell: " + sellOrders[i] + "\nbuy: " + buyOrders[j]);
				
				price = sellOrders[i].price;
				quantity = sellOrders[i].quantity;

			}
			
			fillSellOrder(i, quantity);
			fillBuyOrder(j, quantity, price);

			checkOrders();
			return;

		}
		
	}
	
	
}
					
function recordOrder(order, amount, type){
	var d = new Date();
	var time = d.toString();
	
	filledOrders.unshift( {item: order.item, quantity: amount, type: type, price: order.price, username: order.username, time: time } );
	console.log("order recorded:\n" + order);
}

function fillSellOrder(index, quantity){
	console.log("Filling Sell Order with index " + index + " filling quantity: " + quantity + " The sell order quantity is: " + sellOrders[index].quantity);
	
	if(index > sellOrders.length-1) return;
	
	var user = exports.bot.users.get(sellOrders[index].userID);
	var price = sellOrders[index].price;
	var total = price*quantity;
	
	bank.addBalanceUser(user, total);
	
	recordOrder(sellOrders[index], quantity, "sell");
	console.log("before sell order quant: " + sellOrders[index].quantity);
	console.log("subtraction quant: " + quantity);
	sellOrders[index].quantity -= quantity;
	console.log("after sell order quant: " + sellOrders[index].quantity);
	
	if(sellOrders[index].quantity <= 0){
		console.log("sell order <= 0. Removing order. Quantity is: " + sellOrders[index].quantity);
		sellOrders.splice(index, 1);
	}
	
	console.log("sell order filled");
	
}

function fillBuyOrder(index, quantity, price){
	console.log("Filling buy order " + index + " quantity: " + quantity);
	if(index > buyOrders.length-1) return;
	var user = exports.bot.users.get(buyOrders[index].userID);
	
	bank.addItemUser(user, buyOrders[index].item, quantity);
	recordOrder(buyOrders[index], quantity, "buy");


	if(price < buyOrders[index].price){
		var refund = ( (buyOrders[index].price * quantity) - (price * quantity) );
		console.log("refund is: " + refund);
		bank.addBalanceUser(user, refund);
	}
	
	buyOrders[index].quantity -= quantity;
	if(buyOrders[index].quantity <= 0){
		console.log("buy order <= 0. Removing order");
		buyOrders.splice(index, 1);
	}
	
	console.log("buy order filled");
}



exports.createBuyOrder = function(user, item, quantity, price){
	price = Math.floor(price);
	if(price <= 0 || price > 1000000000) return false;
	
	quantity = Math.floor(quantity);
	if(quantity <= 0) return false;
	
	var total = price*quantity;
	
	if(!bank.subtractBalanceUser(user, total)) return false;
	
	var index = buyOrders.push( {item: item, quantity: quantity, price: price, userID: user.id, username: user.username} ) - 1;
	checkOrders();
	saveExchange();
	return true;
};

exports.createSellOrder = function(user, item, quantity, price){
	price = Math.floor(price);
	if(price <= 0 || price > 1000000000) return false;
	
	quantity = Math.floor(quantity);
	if(quantity <= 0) return false;
	
	if(bank.getItemBalanceUser(user, item) < quantity) return false;
	
	bank.subtractItemUser(user, item, quantity);
	
	var index = sellOrders.push( {item: item, quantity: quantity, price: price, userID: user.id, username: user.username} ) - 1;
	checkOrders();
	saveExchange();
	return true;
};

function cancelSellOrder(index){
	if(index > sellOrders.length - 1) return false;
	
	var user = exports.bot.users.get(sellOrders[index].userID);
	var item = sellOrders[index].item;
	var quantity = sellOrders[index].quantity;
	
	bank.addItemUser(user, sellOrders[index].item, quantity);
	sellOrders.splice(index, 1);
	
	return true;
}

function cancelBuyOrder(index){
	if(index > buyOrders.length - 1) return false;
	console.log("canceling buy order " + index);
	
	var user = exports.bot.users.get(buyOrders[index].userID);
	var quantity = buyOrders[index].quantity;
	var price = buyOrders[index].price;
		
	bank.addBalanceUser(user, quantity * price);
	buyOrders.splice(index, 1);
	
	return true;
}


exports.removeAllSellOrdersUser = function(user){
	var id = user.id;
	
	for(var i = sellOrders.length - 1; i >= 0; i--){
		
		if(sellOrders[i].userID == id){
			
			cancelSellOrder(i);
			
		}
		
	}
	saveExchange();
};

exports.removeAllBuyOrdersUser = function(user){
	var id = user.id;
	
	for(var i = buyOrders.length - 1; i >= 0; i--){
		
		if(buyOrders[i].userID == id){
			
			cancelBuyOrder(i);
		
		}
	}
	saveExchange();

};
exports.getHistory = function(amount){
	var returned = "**Market History:** ";
	amount = Math.min(amount, 20, filledOrders.length);
	
	if(filledOrders.length == 0) return(returned);
	
	for(var i = 0; i < amount; i++){
		returned = returned + "\n **Item**: " + filledOrders[i].item + "   **Quantity**: " + filledOrders[i].quantity + " " + filledOrders[i].type + " **Price Each**: " + filledOrders[i].price + config.currency + "    " + filledOrders[i].username + "    *" + filledOrders[i].time + "*";
	}
	return returned;
};

exports.getSellOrders = function(start, amount){
	var returned = "**Sell Orders:** ";
	amount = Math.min(amount, sellOrders.length);
	start = Math.min(start, sellOrders.length-1);

	if(sellOrders.length == 0) return(returned);
	
	for(var i = start; i < amount; i++){
		returned = returned + "\n **Item**: " + sellOrders[i].item + "    **Quantity**: " + sellOrders[i].quantity + "    **Price Each**: " + sellOrders[i].price + config.currency + "    " + sellOrders[i].username;
	}
	
	return(returned);
};

exports.getBuyOrders = function(start, amount){
	var returned = "**Buy Orders:** ";
	amount = Math.min(amount, buyOrders.length);
	start = Math.min(start, buyOrders.length-1);

	if(buyOrders.length == 0) return(returned);
	
	for(var i = start; i < amount; i++){
		returned = returned + "\n **Item**: " + buyOrders[i].item + "    **Quantity**: " + buyOrders[i].quantity + "    **Price Each**: " + buyOrders[i].price + config.currency + "    " + buyOrders[i].username;
	}
	
	return(returned);
};

