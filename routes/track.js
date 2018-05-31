const Track = require('../controllers/track');

module.exports = function(server) {
  server.post('/track', function(req, res, next) {
    Track.set(req.body.geoData, () => {
      res.send(201);
    })
  });
};
