const Discord = require('discord.js');
var GIFEncoder = require('gifencoder');
var Canvas = require('canvas');
var Image = Canvas.Image;
var fs = require('fs');
var request = require('request');

var config = require('../json/config.json');
var bank = require('./bank.js');

var kinokoID = '401684543326781440';

var startTime = 0;
var endTime = 0;


var kinURL = 'https://cdn.discordapp.com/avatars/401684543326781440/84ec659dcd53cdcd68baf6c8f5210058.png'

var kinoko = bank.bankFindByID(kinokoID);

if(!kinoko.hasOwnProperty('mushroomSpin')){
	kinoko.mushroomSpin = {jp: 0, income: 0, outcome: 0, spins: 0};
}

function loadImg(url){
	return new Promise(function(resolve, reject){

		request.get({ url: url, method: 'GET', encoding: null }, function(err, res, body) {
			if (err) throw err;

			var image = new Image();

			image.onerror = function() {
				console.error(arguments);
			};

			image.onload = function() {
				console.log('loaded image');
				resolve(image);
			};

			image.src = new Buffer(body, 'binary');
		});
	});
}

function makeSpinner(width, height, img){
	return new Promise(function(resolve, reject){
		var canvas = new Canvas(width, height);
		var ctx = canvas.getContext('2d');
		var cirImg = new Image();
		ctx.save();
		ctx.beginPath();
		var len = Math.round(width*0.15);
    	ctx.moveTo(width/2 - len, height/2 - len);
		ctx.lineTo(width/2 + len, height/2 - len);
		ctx.lineTo(width/2, 0);
		ctx.closePath();
		ctx.fill();
		ctx.strokeStyle=('#FF0000');
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.restore();
		ctx.moveTo(0,0);
		ctx.beginPath();
		ctx.arc(width/2,height/2, width/4, 0, Math.PI*2); // you can use any shape
		ctx.closePath();
		ctx.clip();
		ctx.fill();
		ctx.drawImage(img, width/2-width/4, height/2-height/4, width/2, height/2);
		//ctx.restore();
		cirImg.onload = function() {
			console.log('loaded spinnerImg');
			resolve(cirImg);
		};
		cirImg.src = canvas.toDataURL();
	});
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random()*16)];
  }
  return color;
}
var rotation = 0;

function makeWheel(width, height, txtSize, choices){
	return new Promise(function(resolve, reject){
		var canvas = new Canvas(width, height);
		var ctx = canvas.getContext('2d');
		var wheel = new Image();
		var seg = choices.length;
		for(var i = 0; i < seg; i++){
			var startAng = i*2/seg*Math.PI;
			var endAng = (i+1)*2/seg*Math.PI;
			var radius = width/2;
			var radiusFactor = 0.8;

			ctx.beginPath();
			ctx.moveTo(width/2,height/2);
			ctx.arc(width/2, height/2, radius, startAng, endAng);
			ctx.fillStyle = getRandomColor();
			ctx.closePath();
			ctx.fill();
		}

		for(var i = 0; i < seg; i++){
			var startAng = i*2/seg*Math.PI;
			var endAng = (i+1)*2/seg*Math.PI;
			var radius = width/2;
			var radiusFactor = 0.8;
			ctx.moveTo(0, 0);
			ctx.font = txtSize + "px Gothic";
			ctx.fillStyle = '#FFFFFF';
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 6;
			var xPos = (width/2 + radius * Math.cos((startAng + endAng)/2) * radiusFactor) - ctx.measureText(choices[i]).width/1.5;
			var yPos = (height/2 + radius  * Math.sin((startAng + endAng)/2) * radiusFactor);
			console.log(`x: ${xPos} y: ${yPos}`);
			ctx.strokeText(choices[i], Math.max(xPos, 0), yPos);
			ctx.fillText(choices[i], Math.max(xPos, 0), yPos);
		}

		wheel.onload = function() {
			console.log('loaded wheelImg');
			resolve(wheel);
		};
		wheel.src = canvas.toDataURL();
	});

}

function spinSpinner(spinner, wheel, choices){
	var width = wheel.width;
	var height = wheel.height;
	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext('2d');
	var encoder = new GIFEncoder(width, height);
	var stream = encoder.createReadStream();
	var frames = 15;
	encoder.start();
	encoder.setRepeat(-1);   // 0 for repeat, -1 for no-repeat
	encoder.setDelay(60);  // frame delay in ms 50ms is 20fps
	encoder.setQuality(10); // image quality. 10 is default.
	encoder.setTransparent(0x36393e);
	ctx.save();
	var spin = Math.round(Math.random() * 3600 + 360)/frames;

	var rotation = -90;
	for(var i = 1; i < frames + 1; i++){
		ctx.resetTransform();
		ctx.clearRect(0,0,width,height);
		ctx.drawImage(wheel, 0, 0);
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.rotate((spin*i)*Math.PI/180);
		rotation += (spin);
		ctx.drawImage(spinner, -spinner.width/2, -spinner.height/2);
		console.log("frame " + i);
		encoder.addFrame(ctx);
	}
	encoder.finish();
	var d = new Date();
	var ms = d.getTime();
	endTime = ms;
	return {stream: stream, choice: choices[Math.floor( ( (rotation % 360) / (360 / choices.length) ))], choiceRaw: ( ( (rotation % 360) / (360 / choices.length) )+1)};

}

exports.spinChoose = function(message){
	var kinImg = loadImg(kinURL);
	if(message.author.avatarURL == null){
		var url = kinURL;
	}else{
		var url = message.author.avatarURL.split('?')[0];
	}
	var d = new Date();
	var ms = d.getTime();
	startTime = ms;

	var msg = message.content.slice(6)
	var choices = msg.split(';');

	if(choices.length == 0){
		return;
	}
	if(choices.length > 180){
		choices.splice(179, choices.length - 180);
	}

	loadImg(url).then( img => {
		if(img.width < 30){
			img = kinImg;
		}
		makeSpinner(128, 128, img).then( spinner => {

			makeWheel(256, 256, 16, choices).then( wheel => {
				var spinned = spinSpinner(spinner, wheel, choices)
				var stream = spinned.stream;
				var attachment = new Discord.Attachment(stream, 'test.gif');
				message.channel.send(endTime - startTime + 'ms. choice: ' + spinned.choice, attachment);
			});

		});

	});


};

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

var prizes = [0, 0, 0, 0, 0, 0, 0, 0.25, 0.5, 1.25, 1.25, 1.5, 1.5, 2, 2]

exports.betSpin = function(message){
	var args = message.content.split(' ');

	if(args.length > 2 || args[1].length == 1){
		message.channel.send("The syntax for bet spin is ]bs 10m for mushrooms or ]bs 10p for pretzels.");
		return;
	}

	if( args[1].endsWith('m') || args[1].endsWith('p') ){
		var currency = args[1].substr(args[1].length - 1);
		if(args[1] == 'ALLm'){
			var bet = bank.getItemBalanceUser(message.author, 'mushrooms');
			if(bet >= 1){
				mushroomSpin(message.channel, message.author, bet, true);
				return;
			}else{
				message.channel.send("Nibba you're broke. Get back to the ditches and earn your pay!");
				return;
			}
		}else{
			var bet = Math.floor( parseInt( args[1].substr( 0, args[1].length -1) ) );
		}
		if(bet < 1 ){
			message.channel.send("Please place a bet greater than 1")
			return;
		}

		if(currency == 'm'){
			mushroomSpin(message.channel, message.author, bet, false);
		}else{
			return;
			//pretzelSpin(message.channel, message.author, bet);
		}

	}else{
		message.channel.send("The syntax for bet spin is ]bs 10m for mushrooms or ]bs 10p for pretzels.");
		return;
	}

};

function mushroomSpin(channel, user, bet, all){
	if(bank.subtractItemUser(user, 'mushrooms', bet)){
		var kinImg = loadImg(kinURL);
		if(user.avatarURL == null){
			var url = kinURL;
		}else{
			var url = user.avatarURL.split('?')[0];
		}
		var d = new Date();
		var ms = d.getTime();
		startTime = ms;

		loadImg(url).then( img => {
			if(img.width < 30){
				img = kinImg;
			}
			makeSpinner(80, 80, img).then( spinner => {
				var prizeShuffle = prizes.slice();
				if(all == true){
					for(var i = 0; i < prizeShuffle.length; i++){
						prizeShuffle[i] *= 2;
					}
				}

				if(kinoko.mushroomSpin.jp >= 6666){
					prizeShuffle.push('JP');
				}else{
					prizeShuffle.push(0);
				}

				shuffle(prizeShuffle);
				makeWheel(200, 200, 12, prizeShuffle).then( wheel => {
					var spinned = spinSpinner(spinner, wheel, prizeShuffle);
					var stream = spinned.stream;
					var attachment = new Discord.Attachment(stream, 'spin.gif');
					kinoko.mushroomSpin.spins += 1;
					if(spinned.choice == 'JP'){
						var pay = Math.min(kinoko.mushroomSpin.jp, bet*20) + bet;
						kinoko.mushroomSpin.jp = kinoko.mushroomSpin.jp + bet - pay;
					}else{
						var prize = spinned.choice;
						var pay = Math.floor(prize * bet);
						var income = bet - pay;
						var jp = Math.floor(income/2);
						kinoko.mushroomSpin.income += Math.max(0, income - jp);
						kinoko.mushroomSpin.outcome += pay;
						kinoko.mushroomSpin.jp += Math.max(0, jp);
					}
					bank.addItemUser(user, 'mushrooms', pay);
					
					if(all == false){
						channel.send(endTime - startTime + 'ms. ' + user + spinned.choice + 'x You risked ' + bet + ' and won ' + pay + ':mushroom:! The jackpot is now ' + kinoko.mushroomSpin.jp + ':mushroom:', attachment);
					}else{
						channel.send(endTime - startTime + 'ms. ' + user + spinned.choice + 'x You risked all ' + bet + ':mushroom: for a chance at double the payout and won ' + pay + ':mushroom:! The jackpot is now ' + kinoko.mushroomSpin.jp + ':mushroom:', attachment);
					}
				});

			});

		});

	}else{
		channel.send("Nibba you don't have that much.")
	}
}

exports.mSpinStats = function(){
	return(`spins: ${kinoko.mushroomSpin.spins} income: ${kinoko.mushroomSpin.income} outcome: ${kinoko.mushroomSpin.outcome} profit: ${kinoko.mushroomSpin.income - kinoko.mushroomSpin.outcome}`);

}