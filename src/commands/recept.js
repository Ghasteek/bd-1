const logger = require('../services/logger').logger;

module.exports = {
    name: 'recept',
    description: 'Odepíše náhodný recept na kávu.',
    execute(msg, args, channel) {
        // 
        const fs = require('fs');
        // path to json file with recipes
        const filePath = 'data/recipes.json';

        if ((args[0] === "add") && (msg.member.permissionsIn(channel).toArray().includes('MANAGE_MESSAGES'))) {
            // trim command and parameter off message content
            msg.content = msg.content.replace("recept add ", "");

            fs.readFile(filePath, 'utf-8', function (err, data) {
                if (err) throw err;

                // load actual state of *.json file
                let recipesObj = JSON.parse(data);
                // add new recipe
                recipesObj.recipes.push(msg.content);

                // write whole bunch to file
                fs.writeFile(filePath, JSON.stringify(recipesObj, null, 4), 'utf-8', function (err) {
                    if (err) throw err;
                    // just say thank you
                    msg.reply("Děkuji za nový recept 😊");
                    logger.info(`recept: User  ${msg.author.tag} added recipe.`, msg.content);
                });
            });


        } else {
            // load *.json file and parse it
            let rawData = fs.readFileSync(filePath);
            let data = JSON.parse(rawData);

            // choose random index and send that recipe 
            let randIndex = Math.floor(Math.random() * Math.floor(data.recipes.length));
            msg.reply(data.recipes[randIndex]);
        }
    },
};