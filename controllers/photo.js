const Logger = require('../utils/logger');
const RaspiCam = require("raspicam");
const Exec = require('child_process').exec;
const Uuid = require('uuid/v4');
const Dir = require('node-dir');
const Moment = require("moment");
const Im = require('simple-imagemagick');
const Rimraf = require('rimraf');
const Fs = require('fs');
const Filterous = require('filterous');
const Path = require('path');
const PathParse = require('path-parse');
const Tar = require('tar');
const Request  = require('request');

const Config = require('../config');
const photoPath = '../snap'; //--should be in config file

module.exports = {
  file: '',
  timelapse: '',

  snap: (Camera, RTS, callback) => {
    const Wawy = require('../controllers/wawy');
    const photoName = `${Path.resolve(__dirname, photoPath)}/${Uuid()}`;
    const camera = new RaspiCam({
      mode: "photo",
      output: `${photoName}.png`,
      encoding: "png",
      timeout: 2000,
      rotation: Camera.rotation,
      width: 1440,
      height: 1080,
    });

    camera.on("start", (err, timestamp) => {
      Logger.log('verbose', 'Snap started...');
      RTS.camera('status:connecting');
      Wawy.set({isSnapping: true}, () => {});
    });

    camera.on("read", (err, timestamp, filename) => {
      this.file = filename;
    });

    camera.on("exit", (timestamp) => {
      Wawy.set({isSnapping: false}, () => {});
      Im.convert([
        `${photoName}.png`,
        '-resize',
        '480',
        `${photoName}_480.png`,
        ], (err, stdout) => {
          if (err) console.log(err);
        });
      RTS.camera('status:uploading:photo', this.file);
      callback(this.file);
    });

    camera.start();  
  },

  list: (callback) => {
    Dir.files(photoPath, (err, files) => {
      if (err) throw err;
      callback(files);
    });
  },

  filters: (photo, filters, callback) => {
    const path = PathParse(`${photoPath}/${photo}`);
    const dir = path.dir
    const base = path.base;
    const ext = path.ext;
    const name = path.name;
    filters.map((filter) => {
      if (['xpro2', 'willow', 'lofi', 'juno', 'clarendon', '1977'].indexOf(filter) > -1) {
        Fs.open(`${dir}/${name}_${filter}${ext}`, 'r', (err, fd) => {
          if (err) {
            if (err.code === 'ENOENT') {
              Fs.readFile(`${photoPath}/${photo}`, (err, buffer) => {
                let f = Filterous.importImage(buffer)
                .applyInstaFilter(filter)
                .save(`${dir}/${name}_${filter}${ext}`);
                callback(null, `${dir}/${name}_${filter}${ext}`);
              });
            } else {
              callback('bad file', null);
            }
          } else {
            callback(null, `${dir}/${name}_${filter}${ext}`);
          }
        });
      } else {
        callback('bad filter', null)
      }
    });      
  },

  startTimelapse: (interval, callback) => {
    Wawy.get((wawy) => {
      const Self = this;
      const date = Moment().format('YYYY-MM-DD-HH:mm');
      this.timelapseName =  `timelapse-${date}`;
      const lastFileName = '';
      const output = `${photoPath}/${this.timelapseName}/%04d.png`;

      this.timelapse = new RaspiCam({
        mode: "timelapse",
        output: output,
        encoding: "png",
        timeout: 0,
        timelapse: interval*1000,
        rotation: wawy.rotation,
        width: 1440,
        height: 1080,
      });
  
      this.timelapse.on("start", (err, timestamp) => {
        console.log("Timelapse started...");
        Wawy.get((wawy) => {
          const timelapses = {
            name: Self.timelapseName,
            count: 0,
            photos: []
          }
          Wawy.pushSubdoc({"_id": wawy._id}, {timelapses: timelapses}, (err, doc) => {});
          Wawy.set({isSnapping: true}, (err, doc) => {});
        });
      });
  
      this.timelapse.on("read", (err, timestamp, filename) => {
        if (filename.indexOf('~') === -1 && filename.indexOf('x_') === -1 && Self.lastFileName != filename) {
          console.log('Read Snap...', filename, Self.timelapseName);
          Self.lastFileName = filename;
          Wawy.get((wawy) => {
            const tl = wawy.timelapses.filter(function (timelapse) {
              return timelapse.name === Self.timelapseName
            }).pop();
            let count = tl.count + 1
            const updateFields = {
              "timelapses.$.count": count, 
              "timelapses.$.updatedAt": Moment()
            }

            Im.convert([
              `${photoPath}/${this.timelapseName}/${filename}`,
              '-resize',
              '480',
              `${photoPath}/${this.timelapseName}/480x_${filename}`,
              ], (err, stdout) => {
                if (err) console.log(err);
              });

            Wawy.setSubdoc({"timelapses._id": tl._id}, updateFields, (err, doc) => {
              if (err) console.log(err)
            });
            Wawy.pushSubdoc({"timelapses._id": tl._id}, {"timelapses.$.photos": {name: filename}}, (err, doc) => {});
          }); 
        }
      });
  
      this.timelapse.on("exit", (timestamp) => {
        console.log('Exit Snap...', Self.timeLapseName);
      });
  
      this.timelapse.on("stop", (err, timestamp) => {
        Wawy.set({isSnapping: false}, (err, doc) => {
          console.log('Update isSnaping to false');
        });    
      });
  
      this.timelapse.start();  
    })

    callback();
  },

  stopTimelapse: (callback) => {
    if (this.timelapse) {
      console.log('Stop Timelapse');
      this.timelapse.stop();
    } else {
      console.log('Stop Timelapse: no active timelapse');
    }
    callback();
  },

  deleteTimelapse: (folder, callback) => {
    Wawy.get((wawy) => {
      const tl = wawy.timelapses.filter(function (timelapse) {
        return timelapse.name === folder
      }).pop();
      if (tl) {
        Rimraf(`${photoPath}/${tl.name}`, () => { 
          Wawy.deleteSubdoc({"_id": wawy._id}, {"timelapses": {"_id": tl._id}}, (err, doc) => {
            callback(true);
          });
        });
      } else {
        callback(false);
      }
    });
  },

  lastTimelapsePhoto: (folder, callback) => {
    Wawy.get((wawy) => {
      wawy.timelapses.map((timelapse) => {
        if (timelapse.name === folder) {
          return callback(timelapse.photos[timelapse.photos.length-1].name);
        }
      });
    });
  },

  stitch: (folder, type, callback) => {
    Wawy.get((wawy) => {
      const timelapsFolder = `${photoPath}/${folder}`;
      const photosToUpload = [];
      const tl = wawy.timelapses.filter(function (tl) {
        return tl.name === folder;
      }).pop();
      if(tl) {
        Wawy.setSubdoc({"timelapses._id": tl._id}, {"timelapses.$.status": "processing"}, (err, doc) => {
          if (err) throw err;
          Logger.log('verbose', 'Timelapse video processing...');
          if (!Fs.existsSync(Path.dirname(timelapsFolder))){
            return callback(404);
          } else {
            const input = `${timelapsFolder}/${Config.convert.inputFiles}`;
            const output = `${timelapsFolder}/${Config.convert.outputFile}`;
            const cmd =`ffmpeg -y -r 6 -i ${input} ${output}`
            const ffmpegCli = Exec(cmd);
            ffmpegCli.stderr.on('data', (data) => {
              Logger.log('verbose', data.trim());
            });
            ffmpegCli.stdout.on('data', (data) => {
              Logger.log('verbose', data.trim());
            });
            ffmpegCli.on('exit', (code) => {
              Wawy.setSubdoc({"timelapses._id": tl._id}, {"timelapses.$.status": "achieve"}, (err, doc) => {
                if (err) throw err;
              });
            });
            return callback(202);
          }
        });
      }
    });
  },

  makeTimelapse: (folder, type, callback) => {
    Wawy.get((wawy) => {
      const timelapsFolder = `${photoPath}/${folder}`;
      const photosToUpload = [];
      const tl = wawy.timelapses.filter(function (tl) {
        return tl.name === folder;
      }).pop();

      if(tl) {
        Wawy.setSubdoc({"timelapses._id": tl._id}, {"timelapses.$.status": "processing"}, (err, doc) => {
          if (err) throw err;
          tl.photos.map((photo) => {
            photosToUpload.push(`480x_${photo.name}`); //--'480x_' sould be a parameter
          })
          console.log('Compress photos...');
          Tar.c(
            {
              gzip: true,
              file: `${timelapsFolder}/photos.tgz`,
              cwd: timelapsFolder,
            },
            photosToUpload
          ).then((err, done) => {
            console.log('Compress photos done');
            const formData = {
              uid: Uuid(),
              timelapse: folder,
              photos: Fs.createReadStream(`${timelapsFolder}/photos.tgz`)
            };
            console.log('Upload photos to microservice at ', `${Config.microservice_url}/video`);
            Request.post({'url': `${Config.microservice_url}/video`, formData: formData}, (err, res, body) => {
              const convertRes = JSON.parse(body);
              console.log('Photo uploaded:', convertRes.status);
              if (convertRes && convertRes.status === 200) {
                console.log('Download timelapse video...');
                Request(`${Config.microservice_url}/${convertRes.video}`)
                .on('response', function(response) {
                  if (response.statusCode) {
                    console.log('Timelapse video file is ready!');
                    console.log('Delete files on', `${Config.microservice_url}/${convertRes.video}`)
                    Request.delete({'url': `${Config.microservice_url}/${convertRes.video}`}, (err, res, body) => {
                      if (res.toJSON().statusCode === 204) {
                        console.log('Microservice video deleted!');
                      }
                    })
                  }
                })
                .pipe(Fs.createWriteStream(`${timelapsFolder}/timelapse.mp4`))
              }
              callback('done');
            });
          })
        });
      }
    });
  }
}
