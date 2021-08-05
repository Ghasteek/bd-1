module.exports = {
    name: 'clear',
    description: 'Delete specified number of messages.',
    execute(msg, args, channel) {
        if (msg.member.permissionsIn(channel).toArray().includes('MANAGE_MESSAGES')) {
            let messagesToDelete = parseInt(args) + 1;
            if (messagesToDelete > 0) {
                channel.bulkDelete(messagesToDelete)
                    .then(messages => console.log(`Deleted ${messages.size} messages.`))
                    .catch(error => {
                        msg.reply(error.message);
                        console.error(error.message);
                    });

            } else {
                msg.reply('Not a number in arguments!');
                console.error('Not a number in arguments!');
            }
        } else {
            console.log(`User ${msg.author.tag} tried CLEAR command without permision.`)
            msg.delete();
        };
    },
};