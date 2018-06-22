const Logger = require('../utils/logger');
const RaspiCam = require('raspicam');
const Exec = require('child_process').exec;
const Path = require('path');
const photoPath = '../snap'; //--should be in config file
const Uuid = require('uuid/v4');

module.exports = {


  startShortVideo: (Camera, RTS, callback) => {
    const Wawy = require('../controllers/wawy');
    Wawy.get((wawy) => {
      const videoName = `${Path.resolve(__dirname, photoPath)}/${Uuid()}`;
      const camera = new RaspiCam({
        mode: "video",
				output: `${videoName}.h264`,
				rotation: wawy.rotation,//270,//180,
				timeout: 12000, //30*60*1000,
				width: 640,
				height: 480,
				profile: 'main',
        // log: () => {
        //   return;
        // },
      });

      camera.on("start", (err, timestamp) => {
        Logger.log('verbose', 'Video started...');
        RTS.camera('status:recording');
        Wawy.set({isSnapping: true}, () => {});
      });

      camera.on("read", (err, timestamp, filename) => {
        this.file = filename;
      });

      camera.on("exit", (timestamp) => {
        Wawy.set({isSnapping: false}, () => {});
        RTS.camera('status:uploading:photo', this.file);
        callback(this.file);
      });

      camera.start();  
    });
  },

  start: (Camera, callback) => {
    const Wawy = require('./wawy');
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
  },

  stop: (callback) => {
    const Wawy = require('./wawy');
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