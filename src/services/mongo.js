require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../services/logger').logger;


mongoose.connect(process.env.MONGO_LINK, { useUnifiedTopology: true, useNewUrlParser: true });

const db = mongoose.connection;

db.on('error', error => logger.error('mongo: Failed connectiong to DB.', error));
db.once('open', () => logger.info('mongo: Connected to DB.'));

// models
const ytbChannels = require('./mongo_models/ytb_channels');

module.exports = {
    db,
    ytbChannels
}