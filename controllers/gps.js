const Logger = require('../utils/logger');
const Exec = require('child_process').exec;
const gpsd = require('node-gpsd');
let gpsListener;
let geoData;

const Self = module.exports = {

  currentPosition: (callback) => {
    return callback(geoData);
  },

  start: (callback) => {
    const lsusb = Exec('lsusb');
    lsusb.stdout.on('data', (data) => {
      if(data.trim().indexOf('Prolific Technology') > -1) {
        Self.listen(callback);
      } else {
        callback(0);
      }
    });
  },
  
  stop: (callback) => {
    if(gpsListener && gpsListener.isConnected()) {
      gpsListener.unwatch();
      gpsListener.disconnect(() => {
        Logger.log('verbose', 'GPS watcher disconnected to GPS.');  
      });
      Logger.log('verbose', 'GPS watcher stopped.');
    } else {
      console.log("no gpsListener");
    }
    callback();
  },

  listen: (callback) => {
    gpsListener = new gpsd.Listener({
      port: 2947,
      hostname: '127.0.0.1',
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
          }
        }
      }
    });
  },
}