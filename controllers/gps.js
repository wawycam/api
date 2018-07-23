const Logger = require('../utils/logger');
const Track = require('../controllers/track');
const gpsd = require('node-gpsd');

var gpsListenner = new gpsd.Listener({
  port: 2947,
  hostname: 'localhost',
  logger:  {
    info: function() {},
    warn: console.warn,
    error: console.error
  },
  parse: false
});

module.exports = {
  start: (RTS, callback) => {
    let geoData = {};
    let trackId;
    if(!gpsListenner.isConnected()) {
      gpsListenner.connect(() => {
        Logger.log('verbose', 'GPS listenner on...');
        gpsListenner.watch();
      });
    } else {
      gpsListenner.watch();
      Logger.log('verbose', 'GPS listenner on (already started)...');
    }

    gpsListenner.on('connected', () => {
      Track.set(RTS, (id) => {
        trackId = id;
        callback(1);
      });
    });

    gpsListenner.on('error.connection', () => {
      callback(0);
    });

    gpsListenner.on('error.socket', () => {
      callback(0);
    });

    gpsListenner.on('raw', (data) => {
      if(data.indexOf('ERROR') === - 1) {
        data  = JSON.parse(data);
        if(data.class === 'TPV') {
          if (data.lat) {
            const geoData = {
              accuracy: null,
              altitude: data.alt,
              heading: data.track,
              speed: data.speed,
              latitude: data.lat, 
              longitude: data.lon,
            };
            Track.setTrack(trackId, geoData, () => {
              console.log('GeoData saved for track ID', trackId);
            });
          }
        }
      }
    });
  },

  stop: (callback) => {
    if(gpsListenner && gpsListenner.isConnected()) {
      gpsListenner.unwatch();
    } else {
      console.log("no gpsListenner");
    }
    callback();
  }
}