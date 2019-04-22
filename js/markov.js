var save = require('./save.js');

module.exports = class Markov {
	
	save(){
		save.markovSave(this.conf, `markov.json`);
		if(!this.raw.length) return;
		save.markovSave(this.raw, `markovraw.json`);
	}

	makeNewConf(){
		console.log("creating default settings markov");
		this.conf = {
			blacklist: [],
			dictLength: 2,
			sayLength: 16,
			array: []
		};
		//this.save();
	}

	createSingles(){
		console.log("generating singles from raw");
		this.singleChains = new Map();
		for(let i = 0; i < this.raw.length; i++){
			this.addDictSingle(this.raw[i]);
		}
	}

	createDoubles(){
		console.log("generating double markovs");
		this.doubles = new Map();
		for(let i = 0; i < this.raw.length; i++){
			this.addDictDouble(this.raw[i]);
		}
	}

	checkForRaw(){
		let file = `./json/markovraw.json`;

		if(save.exists(file)){
			try{
				this.raw = require('.' + file);
			}catch (err){
				console.log(err);
				return;
			}
		}else{
			this.raw = [];
		}


	}
	checkForConfig() {
		let file = `./json/markov.json`;
		console.log("file: " + file);
		if(save.exists(file) == true){
			try{
				this.conf = require('.' + file);
			}catch (err){
				this.makeNewConf();
				console.log(err);
				return;
			}
			console.log("loaded markov settings");
			return;
		}else{
			this.makeNewConf();
			console.log("else save exists");
			return;
		}
	}


	
	init() {
		this.checkForConfig();
		//this.checkForSingle();
		this.checkForRaw();
		this.createSingles();
		this.createDoubles();
	}

	addDict(txt){
		this.addRaw(txt.toLowerCase().trim());
		this.addDictSingle(txt);
		this.addDictDouble(txt);
	}

	addRaw(txt){
		this.raw.push(txt);
	}

	addDictSingle(txt){
		let words = txt.toLowerCase().trim().split(/ +/g);
		if(words.length < 2) return;

		for(let i = 0; i < words.length - 1; i++){
			let key = words[i];
			let value = words[i + 1];
			value = words[i + 1];
			//console.log("key is: " + key + '\nvalue is: ' + value);
			if( this.singleChains.has(key)){
				this.singleChains.get(key).values.push(value);
				//console.log("updated key value");
			}else{
				this.singleChains.set(key, {values: [value]});
				//console.log("added new key");
			}
		}
	}

	addDictDouble(txt){
		let words = txt.toLowerCase().trim().split(/ +/g);
		if(words.length < this.conf.dictLength + 1) return;

		for(let i = 0; i < words.length - this.conf.dictLength; i++){
			let key = '';
			let value = '';
			for(let j = 0; j < this.conf.dictLength; j++){
				key += words[i + j];
				key += ' ';
			}
			key = key.trim();
			value = words[i + this.conf.dictLength];
			//console.log("key is: " + key + '\nvalue is: ' + value);
			if( this.doubles.has(key)){
				this.doubles.get(key).values.push(value);
				//console.log("updated key value");
			}else{
				this.doubles.set(key, {values: [value]});
				//console.log("added new key");
			}
		}

	}

	genRandom(){
		let dict = [...this.doubles];
		let start = Math.floor(Math.random()*dict.length);
		let string = dict[start][0] + ' ';
		//console.log("string: " + string);

		for(let i = 0; i < this.conf.sayLength; i++){
			let key = '';
			let words = string.trim().split(/ +/g);

			for(let j = words.length - this.conf.dictLength; j < words.length; j++){
				key += words[j];
				key += ' ';
			}

			key = key.trim();
			if(this.doubles.has(key)){
				let values = this.doubles.get(key).values;
				string += values[Math.floor(Math.random()*values.length)];
				string += ' ';
			}else{
				break;
			}
		}
		return string;
	}

	genSingleRandom(){
		let dict = [...this.singleChains];
		let start = Math.floor(Math.random()*dict.length);
		let string = dict[start][0] + ' ';
		//console.log("string: " + string);

		for(let i = 0; i < this.conf.sayLength; i++){
			let words = string.trim().split(/ +/g);
			let key = words[words.length - 1];

			if(this.singleChains.has(key)){
				let values = this.singleChains.get(key).values;
				string += values[Math.floor(Math.random()*values.length)];
				string += ' ';
			}else{
				break;
			}
		}
		return string;
	}

	genSingleWord(word){
		if(!word.length){
			return '';
		}
		if(this.singleChains.has(word)){
			let string = word + ' ';
			for(let i = 0; i < this.conf.sayLength; i++){
				let words = string.trim().split(/ +/g);
				let key = words[words.length - 1];

				if(this.singleChains.has(key)){
					let values = this.singleChains.get(key).values;
					let ind = Math.floor(Math.random()*values.length);
					string += values[ind];
					string += ' ';
				}else{
					break;
				}
			}
			return string;
		}else{
			return '';
		}

	}
}