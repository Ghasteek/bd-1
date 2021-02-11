module.exports = {
    name: "hra",
    description: "Kámen nůžky papír :-) ",
    execute(msg) {
        msg.reply("Tak si pojďme zahrát! :smirk: Máš 20 vteřin na reakci, tik tak tik tak 😁").then(sentMsg => {
            sentMsg.react('🪨'); // rock
            sentMsg.react('✂️'); // scissors
            sentMsg.react('🧻'); // paper
            // TODO - emotikony dát do array, reagovat všemi, po reakci hráče pak vybrat náhodné číslo 1-3 a vyhodnotit výsledek

            sentMsg.awaitReactions((reaction, user) => user.id == msg.author.id && (reaction.emoji.name == '🪨' || reaction.emoji.name == '✂️' || reaction.emoji.name == '🧻') ,
                { max: 1, time: 20000}).then(collected => {
                    msg.reply(collected.first().emoji.name);
                }).catch(() => {
                    msg.reply("Pozdě! Vyhrál jsem! 😁");
                });
        });
    }
};