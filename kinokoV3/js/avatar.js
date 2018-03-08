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

function makeTunnel(img, frames){
	var width = img.width*2;
	var height = img.height*2;
	var texHeight = img.height;
	var texWidth = img.width;
	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext('2d');
	var canv2 = new Canvas(img.width, img.height);
	var buffer1 = canv2.getContext('2d');
	var encoder = new GIFEncoder(width, height);
	var stream = encoder.createReadStream();

	var distanceTable = new Array(height * 2);
	for (var i = 0; i < height * 2 ; i++) {
	  distanceTable[i] = new Array(width * 2);
	}

	var angleTable = new Array(height * 2);
	for (var i = 0; i < height * 2 ; i++) {
	  angleTable[i] = new Array(width * 2);
	}

	encoder.start();
	encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
	encoder.setDelay(100);  // frame delay in ms 50ms is 20fps
	encoder.setQuality(20); // image quality. 10 is default.
	encoder.setTransparent(0x36393e);

	buffer1.drawImage(img, 0, 0, texWidth, texHeight);
	for(var y = 0; y < height * 2; y++){
		for(var x = 0; x < width * 2; x++){
			var ratio = 32;
			var distance = (ratio * texHeight / Math.sqrt((x - width) *  (x - width) + (y - height) * (y - height))) % texHeight;
			angle = 0.5 * texWidth * Math.atan2(y - height, x - width) / Math.PI;
			distanceTable[y][x] = distance;
			angleTable[y][x] = angle;
			//console.log("disttable " + distanceTable[y][x] + ' angtable ' + angleTable[y][x] + 'x: ' + x + 'y: ' + y);
		}
	}
	console.log("test?");
	var animation = 2;
	var shiftX;
	var ShiftY;
	var color;
    var shiftLookX;
    var shiftLookY;

	for(var i = 0; i < frames; i++){
		//calculate the shift values out of the animation value
		shiftX = Math.round(texWidth * 0.5 * animation);
		shiftY = Math.round(texHeight * 0.25 * animation);
		shiftLookX = width / 2 + Math.round(width / 2 * Math.sin(animation*1.1));
		shiftLookY = height / 2 + Math.round(height / 2 * Math.sin(animation));
		for(var y = 0; y < height; y++){
			for(var x = 0; x < width; x++){
				//console.log("or here?");
			  //get the texel from the texture by using the tables, shifted with the animation values
			  //color = buffer1.getImageData(50, 50, 1, 1);
			  var calcX = Math.round((distanceTable[x + shiftLookX][y + shiftLookY] + shiftX)  % texWidth);
			  var calcY = Math.round((angleTable[x + shiftLookX][y + shiftLookY] + shiftY) % texHeight);
			  if(calcX < 0){
			  	calcX += width*2;
			  }
			  if(calcY < 0){
			  	calcY += height*2;
			  }
			   //console.log('calcX: ' + calcX + 'calcY: ' + calcY);
			  color = buffer1.getImageData(calcX, calcY , 1, 1);
			  ctx.putImageData(color, x, y)
			}
		}
		encoder.addFrame(ctx);
		animation += 0.1;
	}
	encoder.finish();
	var d = new Date();
	var ms = d.getTime();
	endTime = ms;
	return stream;
}

exports.tunnelAvatar = function(message){
	var url = message.author.avatarURL.split('?')[0];
	var d = new Date();
	var ms = d.getTime();
	startTime = ms;

	loadImg(url).then( img => {
		var avatar = img;
		var stream = makeTunnel(avatar, 50);
		var attachment = new Discord.Attachment(stream, 'test.gif');
		message.channel.send(endTime - startTime + 'ms', attachment);
	})
}


exports.sin = function(message){
	var url = message.author.avatarURL.split('?')[0];
	var d = new Date();
	var ms = d.getTime();
	startTime = ms;

	loadImg(url).then( img => {
		var avatar = img;
		var stream = sinLoop(avatar, 30);
		var attachment = new Discord.Attachment(stream, 'test.gif');
		message.channel.send(endTime - startTime + 'ms', attachment);
	});
}

function sinLoop(img, frames){
	var width = img.width;
	var height = img.height;
	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext('2d');
	var canv2 = new Canvas(width, height);
	var canv3 = new Canvas(width, height);
	var buffer1 = canv2.getContext('2d');
	var buffer2 = canv3.getContext('2d');
	var encoder = new GIFEncoder(width, height);
	var stream = encoder.createReadStream();
	encoder.start();
	encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
	encoder.setDelay(100);  // frame delay in ms 50ms is 20fps
	encoder.setQuality(20); // image quality. 10 is default.
	encoder.setTransparent(0x36393e);

	buffer1.drawImage(img, 0, 0);


	var mult = 10
	for(var i = 0; i < frames; i++){
		// Find the sine of the angle
		mult *= 1.1;
		for(var y = 0; y < height; y++){
			for(var x = 0; x < width; x++){

				var yDistort =  (y + Math.round(10*Math.sin(x/i+5)) + height) % height;
				var xDistort =  (x + Math.round(10*Math.cos(y/i+5)) + width) % width;
				var distortPix = buffer1.getImageData(xDistort, yDistort, 1, 1);
				ctx.putImageData(distortPix, x, y);
				//console.log('yDistort: ' + yDistort + 'x: ' + x + 'y: ' + y + 'width: ' + width + 'height' + height);
			}
		}
		encoder.addFrame(ctx)
	}

	encoder.finish();
	var d = new Date();
	var ms = d.getTime();
	endTime = ms;
	return stream;

}

exports.AAA = function(message){
	var url = message.author.avatarURL.split('?')[0];
	var d = new Date();
	var ms = d.getTime();
	startTime = ms;

	loadImg(url).then( img => {
		var avatar = img;
		var stream = scream(avatar, 50);
		var attachment = new Discord.Attachment(stream, 'test.gif');
		message.channel.send(endTime - startTime + 'ms', attachment);
	})
}

function scream(avatar, frames){
	var width = avatar.width;
	var height = avatar.height;
	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext('2d');
	var encoder = new GIFEncoder(width, height);
	var stream = encoder.createReadStream();
	encoder.start();
	encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
	encoder.setDelay(40);  // frame delay in ms 50ms is 20fps
	encoder.setQuality(20); // image quality. 10 is default.
	encoder.setTransparent(0x36393e);
	ctx.save();
	var text = "A";
	var intensity = 1;
	var scale = 1;
	for(var i = 0; i < frames; i++){
		intensity += 0.1;
		scale += i/2000;
		var imgX = (Math.random() * 2 * intensity - 1 - intensity / 2) - (avatar.width*scale - avatar.width)/2;
		var imgY =  (Math.random() * 2 * intensity - 1 - intensity / 2) - (avatar.height*scale - avatar.height)/2;
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = "#36393e";
		ctx.fillRect(0, 0, width, height);
		ctx.drawImage(avatar, imgX, imgY, avatar.width*scale, avatar.height*scale);
		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.globalAlpha = 0.6/frames*i;
		ctx.fillRect(0, 0, width, height);
		ctx.font =  "20px Gothic";
		ctx.fillStyle = '#FFFFFF';
		ctx.strokeStyle = '#000000';
		ctx.lineWidth = 2;
		text += "AA";
		if((i+1)%6 == 0){
			text += "\n";
		}
		ctx.globalAlpha = 1.0;
		var txtX = Math.random()*2 * intensity/2 - 1 - intensity/4;
		var txtY = Math.random()*2 * intensity/2 - 1 - intensity/4;
		ctx.strokeText(text, txtX, txtY+10);
		ctx.fillText(text, txtX, txtY+10);
		console.log("frame " + i);
		encoder.addFrame(ctx);
	}

	encoder.finish();
	var d = new Date();
	var ms = d.getTime();
	endTime = ms;
	return stream;

}