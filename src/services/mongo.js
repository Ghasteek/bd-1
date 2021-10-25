require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../services/logger').logger;

mongoConnect();

const db = mongoose.connection;

db.on('error', error => {
    logger.error('mongo: Failed connectiong to DB.', error);
    mongoose.disconnect();
    mongoConnect();
});

db.once('open', () => logger.info('mongo: Connected to DB.'));

// models
const ytbChannels = require('./mongo_models/ytb_channels');

function mongoConnect() {
    mongoose.connect(process.env.MONGO_LINK, { useUnifiedTopology: true, useNewUrlParser: true }).catch(err => {
        logger.debug('mongo: Cannot connect, try again in 10s...');
        setTimeout(() => {
            mongoConnect();
        }, 10000);
    });;
}

module.exports = {
    db,
    ytbChannels
}