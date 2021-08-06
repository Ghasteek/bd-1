const mongoose = require('mongoose');

const ytbChannelSchema = mongoose.Schema({
    channelId: {
        type: String,
        required: true
    },
    channelName: {
        type: String,
        required: true
    },
    playlistId: {
        type: String,
        required: true
    },
    lastVideoId: {
        type: String,
        required: false
    },
    lastVideoTitle: {
        type: String,
        required: false
    },
    discordChannel: {
        type: String,
        required: true
    },
    discordMention: {
        type: String,
        required: false
    },
    wasNew: {
        type: Boolean,
        required: false
    }
});

module.exports = mongoose.model('Record', ytbChannelSchema);
