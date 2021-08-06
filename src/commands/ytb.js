require('dotenv').config();
const axios = require('axios');

const mongo = require('../services/mongo');
const checker = require('../services/ytb_checker');

/**
 * Take channel object and save it to file. Then, thanks to msg object, will answer to user, that channel was added to watched
 * @param {Object} channel - channel object, that has to be added to watched => { channelName, channelId, playlistId,
 *  lastVideoId, lastVideoTitle, discordChannel, discordMention }
 * @param {Object} msg - message object of command message
 */
function saveNewChannel(channel, msg) {
  try {
    let newChannel = new mongo.ytbChannels(channel);
    newChannel.save();
    console.log(`User ${msg.author.tag} added ytb channel ${channel.channelName}`);
    msg.reply(`Přidán kanál  ${channel.channelName} 👍`);
    msg.delete();
  } catch (error) {
    console.log(error)
  }
}


/**
 * Check already watched channels, if channel is already watched, notify user and return true, if it is not watched, return false
 * @param {String} channelId - string of channel ID
 * @param {Object} msg - message object of command message
 * @returns Boolean - is channel watched > TRUE, is not watched > FALSE
 */
async function isWatched(channelId, msg) {
  // is channel already watched?
  const channels = await mongo.ytbChannels.find({ channelId: channelId });
  if (channels.length) {
    // if channel is already watched, notify user and remove message with command
    console.log(`User ${msg.author.tag} tried to add already watched channel.`)
    msg.reply(`Kanál ${channels[0].channelName} je již sledován ✋`);
    msg.delete();
    return true;
  }
  return false;
}


/**
 * Take whole command and execute it
 * @param {Object} msg - message object of command message
 * @param {Array} args - Array of arguments of command
 * @param {Object} discordChannel - Object of channel, from which was command sent
 */
function execute(msg, args, discordChannel) {
  if (msg.member.permissionsIn(discordChannel).toArray().includes('MANAGE_MESSAGES')) {
    if (args.length !== 3) {
      // if not enougth arguments, notify user and remove message with command
      console.log(`User ${msg.author.tag} tried to add channel with wrong arguments.`)
      msg.reply(`Špatně jsi zadal příkaz 👎`);
      msg.delete();
    } else {
      isWatched(args[1], msg).then((resp) => {
        if (!resp) {
          // ask ytb API
          axios.get(`https://www.googleapis.com/youtube/v3/channels?key=${process.env.YTB_API_KEY}&id=${args[1]}&part=contentDetails,snippet`)
            .then(response => {
              if (response.data.pageInfo.totalResults === 0) {
                // if no channel found, notify user and delete message with command
                console.log(`User ${msg.author.tag} tried to add invalid youtubeID channel.`)
                msg.reply(`Špatné ID kanálu 👎`);
                msg.delete();
              } else {
                // get last video
                checker.getLastVideo(response.data.items[0].contentDetails.relatedPlaylists.uploads)
                  .then((video) => {
                    // send whole channel to save
                    let channel = {
                      channelName: response.data.items[0].snippet.title,
                      channelId: args[1],
                      playlistId: response.data.items[0].contentDetails.relatedPlaylists.uploads,
                      lastVideoId: video.lastVideoId,
                      lastVideoTitle: video.lastVideoTitle,
                      discordChannel: args[0],
                      discordMention: args[2]
                    }
                    saveNewChannel(channel, msg);
                  });
              }
            });
        }
      });
    }
  } else {
    console.log(`User ${msg.author.tag} tried YTB command without permision.`)
    msg.delete();
  };
}

module.exports = {
  name: "ytb",
  description: "Přidá ytb kanál ke sledovaným",
  execute
}
