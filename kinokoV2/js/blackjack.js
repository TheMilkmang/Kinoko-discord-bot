var Shuffle = require('shuffle');

function newGame(author){
	var author.deck = Shuffle.shuffle();
	var author.cards = 
}

exports.bj = function(bank, message){
	if(message.author.hasOwnProperty('bjPlaying') && message.author.bjPlaying === false){
		newGame(author);
	}
}