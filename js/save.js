var fs = require("fs");
var Path = require('path');

exports.markovSave = function(obj, name){
	var json = JSON.stringify(obj);
	var path = './json/' + name;

	fs.writeFile(path, json, 'utf8', (err) => {
  		if (err) throw err;
		console.log(path + " has been saved.");
	});
}

exports.jsonSave = function(obj, name){
	var json = JSON.stringify(obj);
	var path = './json/' + name;
	
		
	
	if(fs.existsSync(path)){
		var d = new Date();
		var append = d.getTime();
		var oldFolder = './json/old' + d.getDate() +'/';
		
		if(fs.existsSync(oldFolder) || fs.mkdirSync(oldFolder)){
			var newPath = oldFolder + append + '_' + name;
			fs.renameSync(path, newPath);
			console.log(newPath + " has been created.");
		}
	}
	
	fs.writeFile(path, json, 'utf8', (err) => {
  		if (err) throw err;
		console.log(path + " has been saved.");
	});
	
}

exports.exists = function(file){
	try{

		fs.accessSync(file, fs.constants.F_OK | fs.constants.W_OK);
		console.log("save.exists");
		return true;
	}catch (err) {
		console.log('file doesnt exist: ' + file);
		return false;
	}

};
