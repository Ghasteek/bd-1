module.exports = {
    name: "reaction_roles",
    init(bot, data, usableEmojis){
        // this will add all roles emoji reactions to message, so others can easily see them...
        let guild = bot.guilds.cache.values();
        guild = guild.next().value;
        let channel = guild.channels.cache.find(channel => channel.id === data.channelID);
        // fetch message and add all usable emojis to that message
        channel.messages.fetch(message => message.id === data.messageID).then(message => {
            usableEmojis.forEach(oneEmoji => {
                message.get(data.messageID).react(oneEmoji);
            });
        }).catch(console.error);
    },
    process(bot, packet, roles){
        // get ROLE object to add or remove
        let guild = bot.guilds.cache.values();
        guild = guild.next().value;
        let role = guild.roles.cache.find(role => role.id === roles[packet.d.emoji.name]);
        // according to passed emoji, add or remove according role
        guild.members.fetch(packet.d.user_id).then(member => {
            if (packet.t == "MESSAGE_REACTION_REMOVE"){
                member.roles.remove(role);
            } else if (packet.t == "MESSAGE_REACTION_ADD"){
                member.roles.add(role);
            } else console.log("error with reaction recognition");
        });
    }
};