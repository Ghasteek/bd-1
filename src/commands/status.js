require('dotenv').config();
const os = require('os');
const axios = require('axios');
const logHistory = require('../services/logger').history;

/**
 * Takes integer number and add leading zeros
 * @param {Integer} number - input number
 * @returns String - String number with leading zeros
 */
function pad(number) {
    if (number < 10) return `0${number}`
    return `${number}`
}

module.exports = {
    name: 'status',
    description: 'Bot status',
    async execute(msg, args) {
        if (msg.author.id !== process.env.ADMIN_ID) {
            return msg.reply('Nemáte právo na zobrazení stavu systému.');
        }

        const maxRam = (os.totalmem / 1024 / 1024 / 1024).toFixed(2);
        const freeRam = (os.freemem / 1024 / 1024 / 1024).toFixed(2);
        const uptime = os.uptime;


        var sec_num = parseInt(uptime, 10);
        var days = Math.floor(sec_num / 86400);
        var hours = Math.floor((sec_num - (days * 86400)) / 3600);
        var minutes = Math.floor(sec_num / 60) % 60;
        var seconds = sec_num % 60

        const uptimeStr = `${days} dní ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

        let ip = '';
        await axios.get('https://api.myip.com')
            .then(res => {
                ip = res.data.ip;
            });
        let message = `\n🖥️ Systém:\n` +
            '\`\`\`' +
            `freeRAM:  ${freeRam} GB\n` +
            `maxRAM:   ${maxRam} GB\n` +
            `uptime:   ${uptimeStr}\n` +
            `IP:       ${ip}\n` +
            '\`\`\`\n' +
            `📝 Log:\n\`\`\`` +
            logHistory.join('\n') +
            '\`\`\`';

        if (args[0] === 'w') {
            msg.author.send(
                message,
                { split: true }
            );
        } else {
            msg.channel.send(
                message,
                { split: true }
            );
        }
        msg.delete();
    },
};