const fs = require('fs');

const puppeteer = require('puppeteer');

var interval;
var botInstance;
const filePath = 'data/channels.json';


async function getLastVideo(channelUrl) {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser'
  })
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(60000)
  await page.setViewport({ width: 1920, height: 969 })

  const navPromise = page.waitForNavigation();

  await page.goto(channelUrl + '/videos')

  await page.waitForSelector('button[jsname="higCR"]')
  await page.click('button[jsname="higCR"]')
  await page.waitForSelector('#video-title', { timeout: 60000 })
    .catch(err => {
      console.log(`error with URL: ${channelUrl}`)
    })

  await navPromise;

  var lastVideo = await page.evaluate((selector) => {
    var channel = document.querySelector('yt-formatted-string[class="style-scope ytd-channel-name"]').innerHTML
    var title = document.querySelector(selector).innerText
    var url = document.querySelector(selector).href
    return { channel, title, url }
  }, '#video-title');

  // console.log(lastVideo);

  await browser.close()
  return lastVideo;
}

async function ytb_checker() {
  console.log('Checking ytb...')

  // load channels from file
  let rawData = fs.readFileSync(filePath);
  let channels = JSON.parse(rawData);

  // check for new videos
  var index = 0;
  channels.forEach(async element => {
    let lastVideo = await getLastVideo(element.url + '/videos');
    if (lastVideo.url !== element.lastVideoUrl) {
      element.wasNew = true;
      element.lastVideoUrl = lastVideo.url;
      element.lastVideo = lastVideo;
    }
    index++;
    if (index === channels.length) {
      index = 0;
      processVideos(channels);
    }
  });
}

function processVideos(channels) {
  let dirty = false;

  channels.forEach((el) => {
    if (el.wasNew === true) {
      dirty = true;
      console.log('Sending new video notify');

      botInstance.channels.cache.get(el.discordChannel)
        .send(`<@&810133478959349790> **${el.lastVideo.channel}** má nové video, koukej! **${el.lastVideo.title}** ${el.lastVideo.url}`)
      delete el.wasNew;
      delete el.lastVideo;
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
