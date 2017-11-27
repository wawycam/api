const exec = require('child_process').exec;
const Wawy = require('../controllers/wawy');

module.exports = {

  startBroadcasting: (callback) => {
    Wawy.get((Wawy) => {
      console.log(`Start picam with ${Wawy.rotation}° rotation lens`);
      picam = exec(`./picam/picam --noaudio --fps 30 -v 2000000 --rotation ${Wawy.rotation} -w 1280 -h 720 -o /run/shm/hls`);
      Wawy.set({isBroadcasting: true}, () => {});
      picam.stdout.on('data', (data) => {
        console.log(data.trim());
        if(data.trim() === 'capturing started') {
          callback(true);
        } else if (data.trim().indexOf('error') > -1) {
          callback(false);
        }
      });
      picam.stderr.on('data', (data) => {
        console.log('stderr: ' + data);
        callback(false);
      });
    });
  },

  stopBroadcasting: (callback) => {
    picam = exec("ps aux  |  grep -i 'picam'  |  awk '{print $2}'  |  xargs sudo kill -9");
    if (picam) {
      picam.on('close', (code) => {
        console.log('closing PICAM: ' + code);
        Wawy.set({isBroadcasting: false}, () => {});
        callback(true);
      });
    } else {
      callback(true);
    }
  } 
}