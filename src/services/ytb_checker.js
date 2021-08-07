require('dotenv').config();
const axios = require('axios');
const mongo = require('../services/mongo');
const logger = require('./logger').logger;

var interval;
var botInstance;

async function getLastVideo(playlist) {
  return new Promise((resolve, reject) => {
    axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?key=${process.env.YTB_API_KEY}&playlistId=${playlist}&part=snippet&order=date`)
      .then(resp => {
        let video = {
          lastVideoTitle: resp.data.items[0].snippet.title,
          lastVideoId: resp.data.items[0].snippet.resourceId.videoId,
        };
        resolve(video);
      })
      .catch(err => {
        logger.error('ytb_checker: Axios error', err);
        reject(err);
      });
  });
}

async function ytb_checker() {
  logger.debug('ytb_checker: Checking ytb...');

  // load channels from db
  const channels = await mongo.ytbChannels.find({});


  // check for new videos
  var promises = [];
  channels.forEach((channel) => {
    promises.push(new Promise((resolve, reject) => {
      getLastVideo(channel.playlistId)
        .then((video) => {
          if (video.lastVideoId !== channel.lastVideoId) {
            channel.wasNew = true;
            channel.lastVideoId = video.lastVideoId;
            channel.lastVideoTitle = video.lastVideoTitle;
          } else {
            channel.wasNew = false;
          }
          resolve(channel);
        })
    }));
    Promise.all(promises)
      .then((values) => {
        if (values.length === channels.length) {
          processVideos(values);
        }
      });
  })
  logger.debug('ytb_checker: Ytb check done');
}

/**
 * Takes array of channels and theirs last videos. If there were some new, post info and save json.
 * @param Array channels - array of channels and their last videos 
 */
function processVideos(channels) {
  channels.forEach((channel) => {
    if (channel.wasNew && channel.wasNew === true) {
      logger.info(`ytb_checker: Sending new video notify into discord channel "${channel.discordChannel}" for ytb channel "${channel.channelName}"`);

      botInstance.channels.cache.get(channel.discordChannel)
        .send(`<@&${channel.discordMention}> **${channel.channelName}** má nové video, koukej! ` +
          `**${channel.lastVideoTitle}** https://www.youtube.com/watch?v=${channel.lastVideoId}`)
      delete channel.wasNew;

      // update channel in DB
      mongo.ytbChannels.updateOne({ channelId: channel.channelId }, channel, function (err, docs) {
        if (err) {
          logger.error(`ytb_checker: Channel ${channel.channelName} failed to update in DB`, err);
        }
        else {
          logger.info(`ytb_checker: Channel ${channel.channelName} updated in DB`);
        }
      });
    }
  });
}

module.exports = {
  name: 'ytb_checker',
  /**
   * Starts interval to check for last ytb videos 
   */
  start(bi) {
    botInstance = bi;
    ytb_checker();
    interval = setInterval(() => {
      ytb_checker();
    }, 600000);
    logger.debug(`ytb_checker: STARTED interval for ytb checker.`);
  },
  /**
  * Stops interval to check for last ytb videos 
  */
  stop() {
    clearInterval(interval);
    logger.debug(`ytb_checker: STOPPED interval for ytb checker.`);
  },
  getLastVideo,
};
