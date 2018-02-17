const Logger = require('../utils/logger');
const Exec = require('child_process').exec;
const Wawy = require('../controllers/wawy');
const photoPath = './snap'; //--should be in config file
const Uuid = require('uuid/v4');

module.exports = {

  start: (callback) => {
    Wawy.get((Camera) => {
      Logger.log('verbose', `Start Video Recording with ${Camera.rotation}° rotation lens`);
      Video = Exec(`raspivid -v --nopreview -t 0 -w 1280 -h 720 -fps 30 -b 1200000 --rotation ${Camera.rotation} -o ${photoPath}/${Uuid()}.h264`);
      Wawy.set({isRecording: true}, () => {});
      //-- command output is on stderr no stdout
      Video.stderr.on('data', (data) => {
        Logger.log('verbose', data.trim());
        if(data.trim().indexOf('Starting video capture') > -1) {
          callback(true);
        } else if (data.trim().indexOf('error') > -1) {
          callback(false);
        }
      });
    });
  },

  stop: (callback) => {
    Logger.log('verbose', `Stop Video Recording`);
    Video = Exec("ps aux  |  grep -i 'raspivid'  |  awk '{print $2}'  |  xargs sudo kill -9");
    if (Video) {
      Video.on('close', (code) => {
        Logger.log('verbose', `Stop capturing: ${code}`);
        Wawy.set({isRecording: false}, () => {});
        callback(true);
      });
    } else {
      callback(true);
    }
  },

  startBroadcasting: (callback) => {
    Wawy.get((Camera) => {
      Logger.log('verbose', `Start picam with ${Camera.rotation}° rotation lens`);
      picam = Exec(`/home/pi/wawycam/picam/picam --noaudio --fps 30 -v 2000000 --rotation ${Camera.rotation} -w 1280 -h 720 -o /run/shm/hls`);
      Wawy.set({isBroadcasting: true}, () => {});
      picam.stdout.on('data', (data) => {
        Logger.log('verbose', data.trim());
        if(data.trim() === 'capturing started') {
          callback(true);
        } else if (data.trim().indexOf('error') > -1) {
          callback(false);
        }
      });
      picam.stderr.on('data', (data) => {
        Logger.error(data);
        callback(false);
      });
    });
  },

  stopBroadcasting: (callback) => {
    picam = Exec("ps aux  |  grep -i 'picam'  |  awk '{print $2}'  |  xargs sudo kill -9");
    if (picam) {
      picam.on('close', (code) => {
        Logger.log('verbose', `closing PICAM: ${code}`);
        Wawy.set({isBroadcasting: false}, () => {});
        callback(true);
      });
    } else {
      callback(true);
    }
  } 
}