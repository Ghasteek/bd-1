require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_LINK, { useUnifiedTopology: true, useNewUrlParser: true });

const db = mongoose.connection;

db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to mongoDB.'));

const ytbChannels = require('./mongo_models/ytb_channels');

module.exports = {
    db,
    ytbChannels
}