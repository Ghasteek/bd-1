const logger = require('../services/logger').logger;

var botInstance;

module.exports = {
    name: "reaction_roles",
    /**
     * 
     * @param {*} bot Instance of bot, so I can get 
     * @param {*} data 
     * @param {*} usableEmojis 
     */
    init(bot, data, usableEmojis) {
        botInstance = bot;
        // this will add all roles emoji reactions to message, so others can easily see them...
        let guild = bot.guilds.cache.values();
        guild = guild.next().value;
        let channel = guild.channels.cache.find(channel => channel.id === data.channelID);
        // fetch message and add all usable emojis to that message
        channel.messages.fetch(message => message.id === data.messageID)
            .then(message => {
                usableEmojis.forEach(oneEmoji => {
                    message.get(data.messageID).react(oneEmoji);
                });
                logger.debug(`reaction_roles: Added model reaction to message ${data.messageID}.`)
            })
            .catch((error) => logger.error(`reaction_roles: Cannot fetch message ${data.messageID}.`, error));
    },
    process(bot, packet, roles) {
        // get ROLE object to add or remove
        let guild = bot.guilds.cache.values();
        guild = guild.next().value;
        let role = guild.roles.cache.find(role => role.id === roles[packet.d.emoji.name]);
        // according to passed emoji, add or remove according role
        guild.members.fetch(packet.d.user_id).then(member => {
            if (packet.t == "MESSAGE_REACTION_REMOVE") {
                member.roles.remove(role);
                logger.info(`reaction_roles: Removed role ${role.name} from user ${member.user.tag}.`);
            } else if (packet.t == "MESSAGE_REACTION_ADD") {
                member.roles.add(role);
                logger.info(`reaction_roles: Added role ${role.name} to user ${member.user.tag}.`);
            } else {
                logger.debug('reaction_roles: Error with reaction recognition.');
            }
        });
    }
};