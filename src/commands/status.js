require('dotenv').config();
const os = require('os');
const axios = require('axios');
const logHistory = require('../services/logger').history;



module.exports = {
    name: 'status',
    description: 'Bot status',
    async execute(msg) {
        if (msg.author.id !== process.env.ADMIN_ID) {
            return msg.reply('Nemáte právo na zobrazení stavu systému.');
        }

        const maxRam = (os.totalmem / 1024 / 1024 / 1024).toFixed(2);
        const freeRam = (os.freemem / 1024 / 1024 / 1024).toFixed(2);
        const uptime = os.uptime;


        var sec_num = parseInt(uptime, 10)
        var days = Math.floor(sec_num / 86400)
        var hours = Math.floor((sec_num - (days * 86400)) / 3600)
        var minutes = Math.floor(sec_num / 60) % 60
        var seconds = sec_num % 60

        const uptimeStr = `${days} dní ${hours}:${minutes}:${seconds}`;

        let ip;
        await axios.get('https://api.myip.com')
            .then(res => {
                ip = res.data.ip;
            });

        msg.reply({
            embed: {
                color: '#000000',
                title: "Status:",
                fields: [
                    { name: 'Systém', value: 'free RAM\ntotal RAM\nIP\nUptime', inline: true },
                    { name: 'Hodnota', value: `${freeRam}GB\n${maxRam}GB\n${ip}\n${uptimeStr}`, inline: true },
                    { name: 'LOG', value: `${logHistory.join('\n')}`, inline: false },
                ]
            }
        });
    },
};