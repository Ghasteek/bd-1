require('dotenv').config();

// new bot instance
const Discord = require('discord.js');
const bot = new Discord.Client();

// defining custom commands from ./commands
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
Object.keys(botCommands).map(key => {
    bot.commands.set(botCommands[key].name, botCommands[key]);
});

// connect to discord, TOKEN from .env
bot.login(process.env.TOKEN);

// Print info about success connecting of bot
bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}.`);
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
            } catch(error) {
                console.error(error);
                msg.reply('There was an error trying to execute this command...')
            }
        } else {
            console.error('no command.');
        };
    };
});