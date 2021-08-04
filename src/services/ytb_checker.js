require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

var interval;
var botInstance;
const filePath = 'data/channels.json';

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
        console.log('Error..', err);
        reject(err);
      });
  });
}

async function ytb_checker() {
  console.log('Checking ytb...')

  // load channels from file
  let rawData = fs.readFileSync(filePath);
  let channels = JSON.parse(rawData);

  // check for new videos
  var index = 0;
  channels.forEach(async channel => {
    await getLastVideo(channel.playlistId)
      .then(video => {
        if (video.lastVideoId !== channel.lastVideoId) {
          channel.wasNew = true;
          channel.lastVideoId = video.lastVideoId;
          channel.lastVideoTitle = video.lastVideoTitle;
        }
        index++;
        if (index === channels.length) {
          index = 0;
          processVideos(channels);
        }
      });
  });
}

/**
 * Takes array of channels and theirs last videos. If there were some new, post info and save json.
 * @param Array channels - array of channels and their last videos 
 */
function processVideos(channels) {
  let dirty = false;

  channels.forEach((channel) => {
    if (channel.wasNew && channel.wasNew === true) {
      dirty = true;
      console.log('Sending new video notify');

      botInstance.channels.cache.get(channel.discordChannel)
        .send(`<@&810133478959349790> **${channel.channelName}** má nové video, koukej! **${channel.lastVideoTitle}** https://www.youtube.com/watch?v=${channel.lastVideoId}`)
      delete channel.wasNew;
    }
  });

  if (dirty) {
    // save into file if there are things to save
    try {
      fs.writeFileSync(filePath, JSON.stringify(channels, null, 2))
      console.log('channels saved')
    } catch (err) {
      console.error(err)
    }
  } else {
    console.log('check done')
  }
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
  }
};


  // // ask this when adding new channel      
  // axios.get(`https://www.googleapis.com/youtube/v3/channels?key=${process.env.YTB_API_KEY}&id=${channelId}&part=contentDetails,snippet`)
  //   .then(resp => {
  //     let channel = {
  //       title: resp.data.items[0].snippet.title,
  //       id: channelId,
  //       upload: resp.data.items[0].contentDetails.relatedPlaylists.uploads,
  //     }
  //     return channel;
  //   });
