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

exports.bot = -1;

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

function makeSpinner(img){
	return new Promise(function(resolve, reject){
		
		var width = img.width;
		var height = img.height;
		var canvas = new Canvas(width, height);
		var ctx = canvas.getContext('2d');
		var cirImg = new Image();
		ctx.save();
		ctx.arc(width/2,height/2, width/4, 0, Math.PI*2); // you can use any shape
		ctx.clip();
		ctx.drawImage(img, width/2-width/4, height/2-height/4, 64, 64);
		ctx.restore();
		ctx.beginPath();
    	ctx.moveTo(width/2 - 20, height/2 - 20);
		ctx.lineTo(width/2 + 20, height/2 - 20);
		ctx.lineTo(width/2, height/2 - 60);
		ctx.fill();
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

function makeWheel(width, height, choices, colors){
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
			ctx.fillStyle = getRandomColor();//colors[i];
			ctx.closePath();
			ctx.fill();
			
			ctx.moveTo(0, 0);
			ctx.font = "16px Gothic";
			ctx.fillStyle = '#FFFFFF';
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 6;
			var xPos = (width/2 + radius * Math.cos((startAng + endAng)/2) * radiusFactor) - ctx.measureText(choices[i]).width/1.1;
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

function spinSpinner(spinner, wheel){
	var width = wheel.width;
	var height = wheel.height;
	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext('2d');
	var encoder = new GIFEncoder(width, height);
	var stream = encoder.createReadStream();
	var frames = 40;
	encoder.start();
	encoder.setRepeat(-1);   // 0 for repeat, -1 for no-repeat 
	encoder.setDelay(50);  // frame delay in ms 50ms is 20fps
	encoder.setQuality(10); // image quality. 10 is default. 
	encoder.setTransparent(0x36393e);
	ctx.save();
	var spin = Math.round(Math.random() * 7200 + 360)/frames;
		
	rotation = -90;
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
	return stream;
	
}

exports.spinChoose = function(message){
	var kinURL = 'https://cdn.discordapp.com/avatars/401684543326781440/84ec659dcd53cdcd68baf6c8f5210058.png'
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
		makeSpinner(img).then( spinner => {
			
			makeWheel(256, 256, choices, [1]).then( wheel => {
				var stream = spinSpinner(spinner, wheel);
				var attachment = new Discord.Attachment(stream, 'test.gif');
				message.channel.send(endTime - startTime + 'ms. rotation: ' + rotation + ' choice: ' + ( ( (rotation % 360) / (360 / choices.length) )+1), attachment);
			});
			
		});
			
	});


};

			