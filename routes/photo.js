const Photo = require('../controllers/photo');
const CronJob = require('cron').CronJob;
let PhotoJob = null;
module.exports = function(server, wawy, sockets, RTS) {
  server.get('/photo', function(req, res, next) {
    Photo.list((photos) => {
      res.json(200, {photos: photos});
    });
  });

  server.get('/photo/timelapse/:folder/last', function(req, res, next) {
    const folder = req.params.folder;
    if (folder) {
      Photo.lastTimelapsePhoto(folder, (photo) => {
        if(!photo) {
          res.send(404, {error: `could'nt find photo in folder ${folder}`});
        } else {
          res.send(200, {photo: photo});
        }
      });
    } else {
      res.json(404, {error: 'bad or missing parameter: folder is required' });
    }
  });

  server.post('/photo', function(req, res, next) {
    Photo.snap(wawy, RTS, (photo, geodata) => {
      res.json(200, { photo, geodata });
    });
  });

  server.post('/photos/:interval', function(req, res, next) {
    const interval = parseInt(req.params.interval);
    let patternToString = '';
    if (interval > 3600) {
      res.json(404, {error: 'Interval could not be greater than 3600 seconds (one hour)'});
    } else {
      const intervalToMinute = interval / 60;
      let pattern = [];
      let time = 0;
      if (intervalToMinute < 1) { // less than one minute
        while(time < 60) { //-- 60 = one minute
          pattern.push(time);
          time += interval;
        }
        patternToString = pattern.join(',') ;
        patternToString+= ' *';
      } else if (intervalToMinute === 1) {
        pattern = '* *';
      } else { // more than one minute
        while(time < 60) { //-- 60 = one hour
          pattern.push(time);
          time += intervalToMinute;
        }
        patternToString = pattern.join(',') ;
        pattern = `00 ${patternToString}`;
      }
      try {
        photoJob = new CronJob(`${patternToString} * * * *`, () => {
          Photo.snap(wawy, RTS, (photo, geodata) => {
            sockets.emit('photo', { photo, geodata });
          });
        }, () => {},
        true,
        );
      } catch(e) {
        console.log(e);
      }
      res.json(200, { pattern });
    }
    
  });

  server.del('/photos', function(req, res, next) {
    photoJob.stop();
    res.json(204);
  });

  server.post('/photo/filter', function(req, res, next) {
    const filter = req.body.filter;
    const photo = req.body.photo;
    if (filter && photo) {
      Photo.filters(photo, [filter], (err, result) => {
        if (err) {
          res.json(404, {error: err});
        } else {
          res.json(200, {filter: filter, photo: result});
        }
      });
    } else {
      res.json(404, {error: 'bad or missing parameter: filter and photo are required' });
    }
  });

  server.post('/photo/timelapse', function(req, res, next) {
    const interval = req.body.interval;
    if (interval) {
      Photo.startTimelapse(interval, () => {
        res.send(201);
      });
    } else {
      res.json(404, {error: 'bad or missing parameter: interval must be an integer' });
    }
  });

  server.del('/photo/timelapse', function(req, res, next) {
    Photo.stopTimelapse(() => {
      res.send(204);
    });
  });

  server.post('/photo/timelapse/footage', function(req, res, next) {
    const folder = req.body.folder;
    if (folder) {
      Photo.stitch(folder, req.body.type, (result) => {
        res.json(result);
      });
    }
  });

  server.del('/photo/timelapse/:folder', function(req, res, next) {
    const folder = req.params.folder;
    if (folder) {
      Photo.deleteTimelapse(folder, (result) => {
        if (result) {
          res.send(204);
        } else {
          res.json(400, {error: `could'nt delete timelapse ${folder}`});
        }
      });
    } else {
      res.json(404, {error: 'bad or missing parameter: folder is required' });
    }
  });
};
