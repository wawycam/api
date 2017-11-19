const restify = require('restify');
const Camera = require('../controllers/camera');
const Settings = require('../controllers/settings');

module.exports = (server) => {
  server.get('/snap', (req, res, next) => {
    Camera.snap((photo) => {
      res.json(200, {status: 200, path: photo});
    });
    return next();
  });

  server.get('/snap/list', (req, res, next) => {
    Camera.list((photos) => {
      res.json(200, {status: 200, list: photos});
    });
    return next();
  });

  server.get('/snap/filter/:filter/:photo', (req, res, next) => {
    Camera.filters(`snap/${req.params.photo}.png`, [req.params.filter], (filteredPhoto) => {
      res.json(200, {status: 200, filter: req.params.filter, photo: req.params.photo});
    });
  });

  server.get('/snap/last/:timelapse', (req, res, next) => {
    const timelapse = req.params.timelapse;
    Camera.lastTimeLapseSnap(timelapse, (photo) => {
      res.json(200, photo);
    });
  });

  server.post('/snap/timelapse', (req, res, next) => {
    const interval = req.body.interval;
    Camera.startTimelapse(interval, () => {
      res.send(201);
    });
  });

  server.post('/snap/timelapse/footage', (req, res, next) => {
    const timelapse = req.body.timelapse;
    Camera.makeTimelapse(timelapse, req.body.type, () => {
      res.send(201);
    });
  });

  server.del('/snap/timelapse', (req, res, next) => {
    Camera.stopTimelapse(() => {
      res.send(204);
    });
  });

  server.del('/snap/timelapse/:timelapse', (req, res, next) => {
    const timelapse = req.params.timelapse;
    Camera.deleteTimelapse(timelapse, () => {
      res.send(204);
    });
  });

};
