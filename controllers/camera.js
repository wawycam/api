const config = require('../config');
const RaspiCam = require("raspicam");
const moment = require("moment");
const uuid = require('uuid/v4');
const fs = require('fs');
const dir = require('node-dir');
const rimraf = require('rimraf');
const filterous = require('filterous');
const pathParse = require('path-parse');
const im = require('simple-imagemagick');
const exec = require('child_process').exec;
const tar = require('tar');
const request  = require('request');
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
      console.log(`${path.dir}/${path.name}_${filter}${path.ext}`);
      fs.open(`${path.dir}/${path.name}_${filter}${path.ext}`, 'r', (err, fd) => {
        if (err) {
          if (err.code === 'ENOENT') {
            fs.readFile(file, (err, buffer) => {
              let f = filterous.importImage(buffer)
              .applyInstaFilter(filter)
              .save(`${path.dir}/${path.name}_${filter}${path.ext}`);
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
    Settings.get((settings) => {
      const Self = this;
      const date = moment().format('YYYY-MM-DD-HH:mm');
      this.timelapseName =  `timelapse-${date}`;
      const lastFileName = '';
      const output = `${photoPath}/${this.timelapseName}/%04d.png`;

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
        Settings.get((camera) => {
          const timelapses = {
            name: Self.timelapseName,
            count: 0,
            photos: []
          }
          Settings.pushSubdoc({"_id": camera._id}, {timelapses: timelapses}, (err, doc) => {});
          Settings.set({isSnaping: true}, (err, doc) => {});
        });
      });
  
      this.timelapse.on("read", (err, timestamp, filename) => {
        if (filename.indexOf('~') === -1 && filename.indexOf('x_') === -1 && Self.lastFileName != filename) {
          console.log('Read Snap...', filename, Self.timelapseName);
          Self.lastFileName = filename;
          Settings.get((camera) => {
            const tl = camera.timelapses.filter(function (timelapse) {
              return timelapse.name === Self.timelapseName
            }).pop();
            let count = tl.count + 1
            const updateFields = {
              "timelapses.$.count": count, 
              "timelapses.$.updatedAt": moment()
            }

            im.convert([
              `${photoPath}/${this.timelapseName}/${filename}`,
              '-resize',
              '480',
              `${photoPath}/${this.timelapseName}/480x_${filename}`,
              ], (err, stdout) => {
                if (err)  console.log(err);
              });

            Settings.setSubdoc({"timelapses._id": tl._id}, updateFields, (err, doc) => {
              console.log(err)
            });
            Settings.pushSubdoc({"timelapses._id": tl._id}, {"timelapses.$.photos": {name: filename}}, (err, doc) => {});
          }); 
        }
      });
  
      this.timelapse.on("exit", (timestamp) => {
        console.log('Exit Snap...', Self.timeLapseName);
      });
  
      this.timelapse.on("stop", (err, timestamp) => {
        Settings.set({isSnaping: false}, (err, doc) => {
          console.log('Update isSnaping to false');
        });    
      });
  
      this.timelapse.start();  
    })
    callback();
  },

  stopTimelapse: (callback) => {
    console.log('stop interval');
    this.timelapse.stop();
    callback();
  },

  lastTimeLapseSnap: (timelapse, callback) => {
    Settings.get((camera) => {
      camera.timelapses.map((tl) => {
        if (tl.name === timelapse) {
          callback(tl.photos[tl.photos.length-1].name);
        }
      });
    });
  },

  deleteTimelapse: (timelapseName, callback) => {
    Settings.get((camera) => {
      const tl = camera.timelapses.filter(function (timelapse) {
        return timelapse.name === timelapseName
      }).pop();
      if (tl) {
        rimraf(`${photoPath}/${tl.name}`, () => { 
          Settings.deleteSubdoc({"_id": camera._id}, {"timelapses": {"_id": tl._id}}, (err, doc) => {
            callback();
          });
        });
      } else {
        callback();
      }
    });
  },

  makeTimelapse: (timelaspe, type, callback) => {
    Settings.get((camera) => {
      const timelapsFolder = `${photoPath}/${timelaspe}`;
      const photosToUpload = [];
      const tl = camera.timelapses.filter(function (tl) {
        return tl.name === timelaspe;
      }).pop();

      Settings.setSubdoc({"timelapses._id": tl._id}, {"timelapses.$.status": "processing"}, (err, doc) => {
        if (err) throw err;
        tl.photos.map((photo) => {
          photosToUpload.push(`480x_${photo.name}`);
        })
        tar.c(
          {
            gzip: true,
            file: `${timelapsFolder}/photos.tgz`,
            cwd: timelapsFolder,
          },
          photosToUpload
        ).then((err, done) => {
          const formData = {
            uid: uuid(),
            timelapse: timelaspe,
            photos: fs.createReadStream(`${timelapsFolder}/photos.tgz`)
          }
          request.post({'url': `${config.microservice_url}/video`, formData: formData}, (err, res, body) => {
            const convertRes = JSON.parse(body);
            if (convertRes && convertRes.status === 200) {
              request(`${config.microservice_url}/${convertRes.video}`)
              .on('response', function(response) {
                if (response.statusCode) {
                  console.log('Timelapse video file is ready!');
                  request.delete({'url': `${config.microservice_url}/${convertRes.video}`}, (err, res, body) => {
                    if (res.toJSON().statusCode === 204) {
                      console.log('Microservice video deleted!');
                    }
                  })
                }
              })
              .pipe(fs.createWriteStream(`${timelapsFolder}/timelapse.mp4`))
            }
            callback('done');
          });
        })
      });
    });
  }
}