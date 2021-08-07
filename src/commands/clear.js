const logger = require('../services/logger').logger;

module.exports = {
    name: 'clear',
    description: 'Delete specified number of messages.',
    execute(msg, args, channel) {
        if (msg.member.permissionsIn(channel).toArray().includes('MANAGE_MESSAGES')) {
            let messagesToDelete = parseInt(args) + 1;
            if (messagesToDelete > 0) {
                channel.bulkDelete(messagesToDelete)
                    .then(messages => logger.info(`clear: User  ${msg.author.tag} deleted ${messages.size} messages.`))
                    .catch(error => {
                        msg.reply('Něco se pokazilo 😟');
                        logger.error(`clear: Error while deleting messages!`, error.message);
                    });

            } else {
                msg.reply('Po příkazu !clear musíš zadat číslo! 🧐');
                logger.info(`clear: User  ${msg.author.tag} called !clear with wrong arguments.`);
            }
        } else {
            logger.info(`clear: User ${msg.author.tag} tried CLEAR command without permision.`);
            msg.delete();
        };
    },
};