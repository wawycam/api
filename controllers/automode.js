const CronJob = require('cron').CronJob;
const Logger = require('../utils/logger');
const Photo = require('../controllers/photo');
const Video = require('../controllers/video');

module.exports = {
  set: (Camera, callback) => {
    if (Camera.isAutoSnapEnable) {
      Logger.verbose(`AutoSnap is enable`);
      const snapJob = new CronJob('00 15,45 * * * *', () => {
        console.log('AutoSnap');
        Photo.snap(Camera, (photo) => {
          Logger.log('verbose', 'Just snap a photo name %s', photo);
        });
        }, () => {
        },
        true,
      );
    }
    if (Camera.isAutoVideoEnable) {
      Logger.verbose(`AutoVideo is enable`);
      const videoJob = new CronJob('00 0,30 * * * *', () => {
        console.log('AutoVideo');
        Video.start(Camera, () => {
          Logger.log('verbose', 'Just start video');
          setTimeout(() => {
            Video.stop(() => {});
          }, 2000);
        });
      }, () => {
      },
      true);
    }
    if (Camera.isGeolocationEnable) {
      Logger.verbose(`Geolocalisation is enable`);
    }
  },
}