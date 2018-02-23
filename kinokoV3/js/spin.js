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

function getCircleImg(img){
	return new Promise(function(resolve, reject){
		
		var width = img.width;
		var height = img.height;
		var canvas = new Canvas(width, height);
		var ctx = canvas.getContext('2d');
		var cirImg = new Image();
		
		ctx.arc(width/2,height/2, width/2, 0, Math.PI*2); // you can use any shape
		ctx.clip();
		ctx.drawImage(img, 0, 0);
		cirImg.onload = function() {
			console.log('loaded circleImg');
			resolve(cirImg);
		};
		cirImg.src = canvas.toDataURL();
	});
}
function rotateAvatar(avatar){
	var width = avatar.width;
	var height = avatar.height;
	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext('2d');
	var encoder = new GIFEncoder(width, height);
	var stream = encoder.createReadStream();
	var frames = 40;
	encoder.start();
	encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat 
	encoder.setDelay(50);  // frame delay in ms 50ms is 20fps
	encoder.setQuality(20); // image quality. 10 is default. 
	encoder.setTransparent(0x36393e);
	ctx.save();
	
	for(var i = 0; i < frames; i++){
		ctx.resetTransform();
		ctx.clearRect(0,0,width,height);
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.rotate(360/frames*i*Math.PI/180);
		ctx.drawImage(avatar, -width/2, -height/2);
		console.log("frame " + i);
		encoder.addFrame(ctx);
	}
	
	encoder.finish();
	var d = new Date();
	var ms = d.getTime();
	endTime = ms;
	return stream;
	
}

exports.getAvatar = function(message){
	var url = message.author.avatarURL.split('?')[0];
	var d = new Date();
	var ms = d.getTime();
	startTime = ms;
	loadImg(url).then( img => { 
		getCircleImg(img).then( cirImg => {
			
		
			var avatar = cirImg;
			var stream = rotateAvatar(avatar);
			var attachment = new Discord.Attachment(stream, 'test.gif');
			message.channel.send(endTime - startTime + 'ms', attachment);
		})
		
	});


};

			