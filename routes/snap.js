const Camera = require('../controllers/camera');

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

  server.post('/snap/timelapse', (req, res, next) => {
    const interval = req.body.interval;
    Camera.startTimelapse(interval, () => {
      res.send(201);
    });
  });

  server.del('/snap/timelapse', (req, res, next) => {
    Camera.stopTimelapse(() => {
      res.send(204);
    });
  });

};
