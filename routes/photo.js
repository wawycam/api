const Config = require('../config');
const Photo = require('../controllers/photo');

module.exports = function(server, wawy) {
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
    Photo.snap(wawy, (photo) => {
      res.json(200, {photo: photo});
    });
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
