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
};
