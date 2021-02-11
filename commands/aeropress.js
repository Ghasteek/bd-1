module.exports = {
    name: 'aeropress',
    description: 'Random recipe for aeropress.',
    execute(msg, args) {
        const fs = require('fs');
        const filePath = 'data/aeropress.json';
        let rawData = fs.readFileSync(filePath);
        let data = JSON.parse(rawData);
        let keys = Object.keys(data);

        if (args[0] === "add"){
            msg.content = msg.content.replace("aeropress add ", "");
            /*console.log(msg.content);
            let newRecipe = {key: msg.content};

            let data = JSON.stringify(newRecipe, null, 2);
            fs.writeFileSync(filePath, data);*/

            /*fs.readFile(filePath, function (err, data) {
                let json = JSON.parse(data);
                json.push('Key : ' + msg.content);
                fs.writeFile(filePath, JSON.stringify(json));
            });*/

            let newRecipe = { key: msg.content } ;
            let data = JSON.stringify(newRecipe)
            fs.appendFile(filePath, data , function (err) {
                if (err) throw err;
                console.log('The "data to append" was appended to file!');
             });

        } else {
            let randIndex = Math.floor(Math.random() * keys.length);
            let randKey = keys[randIndex];
            let name = data[randKey]
    
            msg.reply(name);
        }
    },
};