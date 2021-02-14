module.exports = {
    name: "hra",
    description: "Kámen nůžky papír :-) ",
    execute(msg) {
        msg.reply("Tak si pojďme zahrát! :smirk: Máš 30 vteřin na reakci, tik tak tik tak 😁").then(sentMsg => {
            // declare emojis for game
            let emojiArray = ['🪨', '✂️', '🧻'];
            // react with these emojis to game message
            emojiArray.forEach(oneEmoji => sentMsg.react(oneEmoji));

            // promise to await reactions with time limit, user limit and reaction limit
            sentMsg.awaitReactions((reaction, user) => user.id == msg.author.id && (emojiArray.includes(reaction.emoji.name)) ,
            { max: 1, time: 30000}).then(collected => {

                // get choice of player
                let reactedIndex = emojiArray.indexOf(collected.first().emoji.name);

                // get my choice
                let myIndex = Math.floor(Math.random() * Math.floor(3));

                // messages declaration
                let replyMessage = `já jsem si vybral ${emojiArray[myIndex]}, takže `;
                let loseMessage = 'jsem prohrál 😭. To byla určitě náhoda! 🥺';
                let winMessage = 'jsem vyhrál 😏. Tak to dopadá, když vyzveš profíka. 😎';
                let drawMessage = 'remíza. 😵';

                // win and lose options
                let win = ["01", "12", "20"];
                let lose = ["02", "10", "21"];
                // converting reactions into string to compare
                let game = myIndex + "" + reactedIndex;

                // check result and make final replyMessage
                if (win.indexOf(game) >= 0){ 
                    replyMessage += winMessage;
                } else if (lose.indexOf(game) >= 0){
                    replyMessage += loseMessage;
                } else {
                    replyMessage += drawMessage
                }

                // reply with replyMessage
                msg.reply(replyMessage);

            }).catch(() => {
                // if time runs out, 
                msg.reply("vypršel ti čas! Vyhrál jsem! 😁");
            });
        });
    }
};