# Kinoko-discord-bot

]help		links this or w/e

---------------------------
]kms		attempts suicide.

]addMethod <method goes here>			"drinking bleach" "jumping off a building" etc
]addSuccess <success text goes here>	"RIP" "I will miss them." "I didn't like that person anyway" "They're in heaven now" etc
]addFail	<fail message here>			"by messing up" "because they weren't careful enough" "and ended up brain dead" etc

@name attempted suicide by <method> but failed <fail message>.  -- if it failed.
@name attempted suicide by <method> and succeeded. <success message>  -- if successful.
---------------------------------

]mushies 				Displays your balance
]m
]mushies @				displays someone elses balance
]m @

]greediest				List richest people
]greediest #			List up to 20 richest people instead of 5.
]poorest				List of poorest people
]poorest #				List up to 20 of poorest people instead of 5.

]send <amount> <@nick>	Send some mushrooms to somebody.	

]bf # <t/h>				Coin flip with a bet of #, for it to land on tails or heads.
]bf ALL <t/h>			Bets all and gives a slight bonus for risking it all

]balloon				Gives information on the current balloon. When it pops the last person owning it wins the prize pool!
]buyballoon				Buys the balloon
]bomb					Gives information about the current bomb. When somebody buys it the money goes to the last person and the price increases!
]buybomb				Buys the bomb for the current price

]work					Generates a random amount of mushies for everyone with an account. YOU control production.
]w
]harvest				A neat new way to generate income
]h

]totalWorked			Tells how much work you've contributed.
]top					Lists the top workers

]population				How many people have used these mushroom commands at least once

---------------------------------
Pretzel Stuff

#UjinBot command#
.give # @kinoko			Deposits a certain amount of pretzels/flowers to the bank of kinoko

]pretzels				see your Bank of Kinoko pretzel balance
]p

]withdraw #				Withdraws an amount of pretzels/flowers from the bank of kinoko

]interest				claims your interest for the day. Right now it's set at 0.5% claimable every 12 hours. Be sure to deposit pretzels first!
]totalInt				shows you how much interest you've earned total with Bank of Kinoko

-- 
exchange

]sellorders				view the current pretzels being sold
]buyorders				view the current buy orders for pretzels

]sellp quantity price	list a quantity of pretzels for sell at a price
]buyp quantity price	list a buy order for a quantity of pretzels at a price (this will buy at that price and anything below that price)

]removesells			remove all of your sell orders and return items to your balance
]removebuys 			remove all of your open buy orders and return mushies to your balance

]history <#>			# is optional. Shows you the market transaction history


Notes: mushrooms and pretzels that you have listed in the exchange won't show up in your balances when you do ]m or ]pretzels. The price is EACH. 1000 pretzels times 100 mushrooms each is a lot of mushrooms, for example.

---------------------------------
TTS stuff

]joinVC					You MUST be in a VC channel. Joins the VC channel you're in. Only one at a time. Do a ]quitVC and rejoin to change
]quitVC					disconnects from the VC channel

]spamTTS				Activates the mode where it reads every message in #botspam without needing TTS. This disables userTTS mode if it was enabled prior
]userTTS				Activates the mode requiring messages to start with ]tts to be read. Disables generalTTS mode. Do either of these commands twice to disable (it's a toggle)
]generalTTS				Same as ]spamTTS but for #general. Only bot owner can use this since it's prone to abuse though. 

]dec <message> 			Uses the dectalk/moonbase alpha voice to talk. This one doesn't queue messages and only plays if there's currently nothing playing.

]tts <message> 			The bot reads your message aloud if it's in userTTS mode and in a VC channel.

]lang <lang-code>		Sets the lang code to use as your voice. Not all of them work for english text, so if it's not speaking and it should then try "en" for the lang code.


Lang codes can be found here: https://cloud.google.com/speech/docs/languages

Don't abuse this or I'll have to restrict these commands and have the mods babysit y'all to use it. One bad apple ruins the bunch eh? ping @meeseeks any issues.

---------------------------------
Cee-Lo

c]bet <bet>				Starts a game and places a bet. You can lose up to twice this amount if you roll a 1-2-3 or someone rolls a 4-5-6! 
c]roll					Makes your roll


https://en.wikipedia.org/wiki/Cee-lo 

Everyone takes a turn rolling the dice. You have up to 3 rolls to get a valid roll. If you don't then your score is 0. The only way you can win with a 0 is if someone rolls a 1-2-3 and has to pay double. I'll put the score chart below. Everybody rolls, if there's a tie then tied players reroll. The winner wins everyone's bets up to the amount that they wagered (so if you bet 100 and your opponent bet 500, you only get 100 of thir bet) 

Valid Rolls:

4-5-6	 	The highest roll. Everyone must pay double!
trips		Higher than a single point. 5-5-5 beats 3-3-3 and so on. 
point		A point is scored by rolling 2 dice of the same number, and then the one left out is your point. So 6-6-3 is a point of 3, 4-4-5 is a point of 5 and beats the former.
1-2-3		The lowest you can roll. You pay double!! 

---------------------------------

DONATE

ETH:	0x242c4910c3Fe7D0E8C418823395AeC579411e042

PayPal: dm me