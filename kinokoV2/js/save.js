var fs = require("fs");


exports.jsonSave = function(obj, name){
	var json = JSON.stringify(obj);
	var path = './json/' + name;

	if(fs.existsSync(path)){
		var d = new Date();
		var append = d.getTime();
		var newPath = './json/old/' + append + '_' + name;
		
		fs.renameSync(path, newPath);
		console.log(newPath + " has been created.");
	}
	
	fs.writeFile(path, json, 'utf8', (err) => {
  		if (err) throw err;
		console.log(path + " has been saved.");
	});
	
}