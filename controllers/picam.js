const exec = require('child_process').exec;
const Settings = require('../controllers/settings');

module.exports = {

  picam: {},

  start: (callback) => {
    Settings.get((settings) => {
      console.log(`Start picam with ${settings.camera.rotation}° rotation lens`);
      picam = exec(`./picam/picam --noaudio --fps 30 -v 2000000 --rotation ${settings.camera.rotation} -w 1280 -h 720 -o /run/shm/hls`);
      Settings.set({isBroadcasting: true});
      picam.stdout.on('data', (data) => {
        console.log(data.trim());
        if(data.trim() === 'capturing started') {
          return callback(true);
        } else if (data.trim().indexOf('error') > -1) {
          return callback(false);
        }
      });
      picam.stderr.on('data', (data) => {
        console.log('stderr: ' + data);
        return callback(false);
      });
    });
  },

  stop: (callback) => {
    picam = exec("ps aux  |  grep -i 'picam'  |  awk '{print $2}'  |  xargs sudo kill -9");
    
    picam.on('close', (code) => {
      console.log('closing PICAM: ' + code);
      Settings.set({isBroadcasting: false});
      return callback(false);
    });
  } 
}