const Discord = require('discord.js');


exports.Page = function(bot, title, content, pageSize){
	this.bot = bot;
	this.title = title;
	this.content = content;
	this.pageSize = pageSize;
	this.page = 0;
	this.pages = [];
	this.nextEmoji = '➡';
	this.prevEmoji = '⬅';
	this.nextID = '';
	this.prevID = '';
	this.message;

	this.makePages();
};

exports.Page.prototype.makePages = function(){
	var size = this.pageSize;
	for (var i=0; i<this.content.length; i+=size) {
    	var slice = this.content.slice(i,i+size);
    	this.pages.push(slice);
	}
}

exports.Page.prototype.update = function(){

	//var msg = this.title + "**" + (this.page + 1).toString() + "**/**" + this.pages.length.toString() + "** \n";
	var msg = '.\n';
	this.pages[this.page].forEach(a => {
		msg += a;
		msg += '\n';
	})
	var loading = new Discord.RichEmbed()
	.setColor("#AA0000")
	.addField(".", ".");
	var embed = new Discord.RichEmbed()
	.setColor("#AA0000")
	.addField(this.title, msg)
	.setFooter(this.page + "/" + this.pages.length);
	this.message.edit("loading", loading)
	.then(this.message.edit(embed));


}

exports.Page.prototype.send = function(channel){
	//var msg = this.title + "**" + (this.page + 1).toString() + "**/**" + this.pages.length.toString() + "** \n";
	var msg = '.\n';
	this.pages[this.page].forEach(a => {
		msg += a;
		msg += '\n';
	})

	var embed = new Discord.RichEmbed()
	.setColor("#AA0000")
	.addField(this.title, msg)
	.setFooter(this.page + "/" + this.pages.length);

	channel.send(embed)
	.then( m => {
		this.message = m;

		m.react(this.prevEmoji)
		.then(r => {
			this.prevID = r.emoji.name

			m.react(this.nextEmoji)
			.then(r2 => {
				this.nextID = r2.emoji.name
				
				console.log("next id: " + this.nextID + " previd: " + this.prevID);
				var filter = (reaction, usr) => ((reaction.emoji.name == this.nextID || reaction.emoji.name == this.prevID) && usr.id != this.bot.user.id)
				var collector = m.createReactionCollector(filter, {time: 120000});
				collector.on('collect', r3 => {

					if(r3.emoji.name == this.nextID){
						this.page = Math.min((this.pages.length -1), (this.page + 1)); 
						console.log("page next");
					}else{
						this.page = Math.max(0, (this.page - 1));
						console.log("page prev");
					}

					r3.fetchUsers()
					.then( u => {
						u.forEach(u2 => {
							if(u2.id != this.bot.user.id){
								r3.remove(u2);
							}
						});
					})
					.catch(console.error);
					this.update();

				});

			})
			.catch(console.error);

		})
		.catch(console.error);


	})
	.catch(console.error);

};