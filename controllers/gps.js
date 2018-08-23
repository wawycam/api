const Logger = require('../utils/logger');
const Track = require('../controllers/track');
const gpsd = require('node-gpsd');
let gpsListener;
let geoData;

module.exports = {

  currentPosition: (callback) => {
    return callback(geoData);
  },

  start: (trackId, RTS, callback) => {
    
    gpsListener = new gpsd.Listener({
      port: 2947,
      hostname: 'localhost',
      logger:  {
        info: function() {},
        warn: console.warn,
        error: console.error
      },
      parse: false
    });

    gpsListener.connect(() => {
      Logger.log('verbose', 'GPS listener on...');
      gpsListener.watch();
    });

    gpsListener.on('connected', () => {
      console.log('connected');
      Track.set(RTS, (id) => {
        trackId = id;
      });
      callback(1);
    });

    gpsListener.on('error.connection', () => {
      console.log('error.connection');
      callback(0);
    });

    gpsListener.on('error.socket', () => {
      console.log('error.socket');
      callback(0);
    });

    gpsListener.on('raw', (data) => {
      if(data.indexOf('ERROR') === - 1) {
        data  = JSON.parse(data);
        if(data.class === 'TPV') {
          if (data.lat) {
            geoData = {
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
    if(gpsListener && gpsListener.isConnected()) {
      gpsListener.unwatch();
      gpsListener.disconnect(() => {
        gpsListener = null;
        Logger.log('verbose', 'GPS watcher disconnected to GPS.');  
      });
      Logger.log('verbose', 'GPS watcher stopped.');
    } else {
      console.log("no gpsListener");
    }
    callback();
  }
}