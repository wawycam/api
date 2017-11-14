const RaspiCam = require("raspicam");
const moment = require("moment");
const uuid = require('uuid/v4');
const fs = require('fs');
const dir = require('node-dir');
const filterous = require('filterous');
const pathParse = require('path-parse');
const Wawy = require('./wawy');
const Settings = require('../controllers/settings');
const photoPath = './snap';
module.exports = {
  file: '',
  timelapse: '',
  snap: (callback) => {
    console.log('Snap in progress...');
    Settings.get((settings) => {
      const camera = new RaspiCam({
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
        console.log("Snap child process has been stopped at " + timestamp);
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
  },

  startTimelapse: (interval, callback) => {
    console.log('Je passe');
    Settings.get((settings) => {
      const Self = this;
      const date = moment().format('YYYY-MM-DD-HH:mm');
      const timeLapseName =  `timelapse-${date}`;
      const lastFileName = '';
      const document = {} //-- To be re-factor
      const output = `${photoPath}/${timeLapseName}/%04d.png`;
      this.timelapse = new RaspiCam({
        mode: "timelapse",
        output: output,
        encoding: "png",
        timeout: 0,
        timelapse: interval*1000,
        rotation: settings.camera.rotation,
        width: 1440,
        height: 1080,
      });

      this.timelapse.on("start", (err, timestamp) => {
        console.log("Timelapse started...");

        Settings.get((wawy) => {
          wawy.timelapses.push({name: timeLapseName, count: 0});
          Settings.set({isSnaping: true, timelapses: wawy.timelapses}, (err, doc) => {
            console.log('Update isSnaping to true');
            Self.document = doc;
          });
        });
        
      });
  
      this.timelapse.on("read", (err, timestamp, filename) => {
        if (filename.indexOf('~') === -1 && Self.lastFileName != filename) {
          console.log('Read Snap...', filename, timeLapseName);
          Self.lastFileName = filename;
          Self.document.timelapses.map((timelapse) => {
            if (timelapse.name === timeLapseName) {
              timelapse.count += 1;
              timelapse.updatedAt = moment();
              Settings.set({timelapses: this.document.timelapses}, (err, doc) => {
              });
            }
          })
        }
      });
  
      // this.timelapse.on("exit", (timestamp) => {
      //   console.log('Exit Snap...', timeLapseName);
      // });
  
      this.timelapse.on("stop", (err, timestamp) => {
        console.log("Timelpase child process has been stopped at " + timestamp);
      });
  
      this.timelapse.start();  
    })
    callback();
  },

  stopTimelapse: (callback) => {
    this.timelapse.stop();
    Settings.set({isSnaping: false}, (err, doc) => {
      console.log('Update isSnaping to false');
    });
    callback();
  }

}