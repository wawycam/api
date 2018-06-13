const Track = require('../controllers/track');

module.exports = function(server) {
  server.post('/track/:id', function(req, res, next) {
    Track.setTrack(req.params.id, req.body.geoData, () => {
      res.send(201);
    })
  });
  server.post('/track', function(req, res, next) {
    Track.set((id) => {
      res.send(201, { id });
    })
  });
};
