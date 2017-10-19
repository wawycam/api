const RaspiCam = require("raspicam");
const uuid = require('uuid/v4');
const fs = require('fs');
const dir = require('node-dir');
const filterous = require('filterous');
const pathParse = require('path-parse');
const Settings = require('../controllers/settings');
const photoPath = './snap';
module.exports = {
  file: '',
  snap: (callback) => {
    console.log('Snap in progress...');
    Settings.get((settings) => {
      var camera = new RaspiCam({
        mode: "photo",
        output: `${photoPath}/${uuid()}.png`,
        encoding: "png",
        timeout: 2000,
        rotation: settings.camera.rotation,
        width: 1440,
        height: 1080,
      });
  
      camera.on("start", (err, timestamp) => {
        console.log("Snap started...");
      });
  
      camera.on("read", (err, timestamp, filename) => {
        this.file = filename;
      });
  
      camera.on("exit", (timestamp) => {
        return callback(this.file);
      });
  
      camera.on("stop", (err, timestamp) => {
        console.log("timelapse child process has been stopped at " + timestamp);
      });
  
      camera.start();  
    })
  },

  filters: (file, filters, callback) => {
    const path = pathParse(file);
    filters.map((filter) => {
      fs.open(`${photoPath}/${path.name}_${filter}${path.ext}`, 'r', (err, fd) => {
        if (err) {
          if (err.code === 'ENOENT') {
            fs.readFile(file, (err, buffer) => {
              let f = filterous.importImage(buffer)
              .applyInstaFilter(filter)
              .save(`${photoPath}/${path.name}_${filter}${path.ext}`);
              return callback(true);
            });
          } else {
            return callback(true);
          }
        } else {
          return callback(true);
        }
      });
    });
        
  },

  list: (callback) => {
    dir.files(photoPath, (err, files) => {
      if (err) throw err;
      callback(files);
    });
  }

}