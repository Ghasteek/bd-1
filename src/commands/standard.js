module.exports = {
    name: 'standard',
    description: 'Standard rulez!!!',
    execute(msg, args, channel) {
        channel.send(`Ano, přesně tak! <@203230872277614592> moc dobře ví, co je to dobrá káva! 😂`, {
            files: [{
                attachment: 'img/standard.png',
                name: 'standard.png'
            }]
        });
    },
};