module.exports = {
    name: "hra",
    description: "Kámen nůžky papír :-) ",
    execute(msg) {
        msg.reply("Tak si pojďme zahrát! :smirk: Máš 20 vteřin na reakci, tik tak tik tak 😁").then(sentMsg => {
            let emojiArray = ['🪨', '✂️', '🧻'];

            emojiArray.forEach(oneEmoji => sentMsg.react(oneEmoji));


            sentMsg.awaitReactions((reaction, user) => user.id == msg.author.id && (reaction.emoji.name == '🪨' || reaction.emoji.name == '✂️' || reaction.emoji.name == '🧻') ,
            { max: 1, time: 20000}).then(collected => {

                let reactedIndex = emojiArray.indexOf(collected.first().emoji.name);

                let myIndex = Math.floor(Math.random() * Math.floor(3));

                // TODO - rozhodnuti o vysledku
                if (myIndex === 0){
                    if (reactedIndex === 0) {
                        msg.reply(`Remiza`);
                    }
                }

                msg.reply(`my index is ${myIndex} / reacted index is ${reactedIndex}`);
                //msg.reply(collected.first().emoji.name);

            }).catch(() => {
                msg.reply("Pozdě! Vyhrál jsem! 😁");
            });
        });
    }
};