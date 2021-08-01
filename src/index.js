const fs = require('fs');

require('dotenv').config();
const Discord = require('discord.js');

// get 
let reactionRoles = require('./services/reaction_roles');
let ytb_checker = require('./services/ytb_checker');

// new bot instance
const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

// defining custom commands from ./commands
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
Object.keys(botCommands).map(key => {
    bot.commands.set(botCommands[key].name, botCommands[key]);
});

// login procedure
botLogin();

// load DATA from *.json file that specifies message to which add listener and emoji - role pairs to assign
// TODO - save this in db??
const filePath = 'data/roles.json';
let rawData = fs.readFileSync(filePath);
let data = JSON.parse(rawData);
let usableEmojis = Object.keys(data.roles);

// ::::::::::::::::::::::::::::::::::::  BOT ACTIONS ::::::::::::::::::::::::::::::::::::

/**
 * Tries to login into discord. If it cannot, tries again in 10 seconds and so on...
 */
function botLogin() {
    // connect to discord, TOKEN from .env
    bot.login(process.env.TOKEN).catch(err => {
        console.log('Cannot login, try again in 10s...');
        setTimeout(() => {
            botLogin();
        }, 10000);
    });
}

// Print info about success connecting of bot
bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.username}.`);
    // init reaction roles handler
    reactionRoles.init(bot, data, usableEmojis);
    ytb_checker.start(bot);
});


// Handle messages on discord server
bot.on('message', msg => {
    // Handle commands. Message have to start with COMMAND_SYMBOL from .env
    if (msg.content.startsWith(process.env.COMMAND_SYMBOL)) {
        // Remove COMMAND_SYMBOL from message 
        msg.content = msg.content.substring(1);
        const args = msg.content.split(/ +/);
        const command = args.shift().toLowerCase();

        // If there is  valid command, execute it, or just log error
        if (bot.commands.has(command)) {
            console.info(`Called command ${command} with arguments: ${args}`);
            try {
                bot.commands.get(command).execute(msg, args, msg.channel);
            } catch (error) {
                console.error(error);
                msg.reply('There was an error trying to execute this command...')
            }
        } else {
            console.error('no command.');
        };
    };
});

// reaction handler from RAW packets (standart actions didnt woked, so I had to use these RAW packets...)
bot.on('raw', async packet => {
    if (((packet.t == "MESSAGE_REACTION_REMOVE") || (packet.t == "MESSAGE_REACTION_ADD")) && (packet.d.message_id == data.messageID) && (usableEmojis.includes(packet.d.emoji.name))) {
        reactionRoles.process(bot, packet, data.roles);
    };
});