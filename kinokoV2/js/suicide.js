var kms = require('../json/kms.json');
var save = require('./save.js');

exports.add = function(message, category){
	
	if(category == "method"){
		
		var string = message.content.slice(11);
		
		if(string){
			kms.suicideAttempts.push(string);
			
			console.log(string + "added to methods.");
			save.jsonSave(kms, "kms.json");
			return("Ok you can now kill yourself by " + string);
		}else {
			return("You typed it wrong...");
		}
		
	}else if(category == "success"){
		var string = message.content.slice(12);
	
		if(string){
			kms.successAttempts.push(string);
			
			console.log(string + "added to success.");
			save.jsonSave(kms, "kms.json");
			return("Now if you succeed at dying, I can say " + string);
		}else {
			return("You typed it wrong...");
		}
	}else if(category == "fail"){
		var string = message.content.slice(9);
		
		if(string){
			kms.failedAttempts.push(string);
			
			console.log(string + "added to failed.");
			save.jsonSave(kms, "kms.json");
			return("Ok, now you can fail " + string);
		}else {
			return("You typed it wrong...");
		}
	}
};

exports.attemptSuicide = function(user) {
	this.attempt = kms.suicideAttempts[ Math.floor( Math.random() * kms.suicideAttempts.length ) ];
	this.fail = kms.failedAttempts[ Math.floor( Math.random() * kms.failedAttempts.length ) ];
	this.success = kms.successAttempts[ Math.floor( Math.random() * kms.successAttempts.length ) ]
	
	if(Math.random() >=0.3){
		return(user + ' ' + "attempted suicide by " + this.attempt + " but failed " + this.fail + '.');
	}else{
		return(user + ' ' + "attempted suicide by " + this.attempt + " and succeeded. " + this.success);
	}
	
};