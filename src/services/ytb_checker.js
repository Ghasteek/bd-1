require('dotenv').config();
const axios = require('axios');
const mongo = require('../services/mongo');

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
        console.error('Error..', err);
        reject(err);
      });
  });
}

async function ytb_checker() {
  console.log('Checking ytb...')

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
  console.log('Ytb check done')
}

/**
 * Takes array of channels and theirs last videos. If there were some new, post info and save json.
 * @param Array channels - array of channels and their last videos 
 */
function processVideos(channels) {
  channels.forEach((channel) => {
    if (channel.wasNew && channel.wasNew === true) {
      console.log(`Sending new video notify for channel ${channel.channelName}`);

      botInstance.channels.cache.get(channel.discordChannel)
        .send(`<@&${channel.discordMention}> **${channel.channelName}** má nové video, koukej! ` +
          `**${channel.lastVideoTitle}** https://www.youtube.com/watch?v=${channel.lastVideoId}`)
      delete channel.wasNew;

      // update channel in DB
      mongo.ytbChannels.updateOne({ channelId: channel.channelId }, channel, function (err, docs) {
        if (err) {
          console.error(`Channel ${channel.channelName} failed update in DB`);
        }
        else {
          console.log(`Channel ${channel.channelName} updated in DB`);
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
    console.log('Started ytb checker.')
  },
  /**
  * Stops interval to check for last ytb videos 
  */
  stop() {
    clearInterval(interval);
    console.log('Stopped ytb checker.')
  },
  getLastVideo,
};
