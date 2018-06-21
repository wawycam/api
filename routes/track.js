const Track = require('../controllers/track');

module.exports = function(server, RTS) {
  server.post('/track/:id', function(req, res, next) {
    Track.setTrack(req.params.id, req.body.geoData, () => {
      res.send(201);
    })
  });
  server.post('/track', function(req, res, next) {
    Track.set(RTS, (id, name) => {
      res.send(201, { id, name });
    })
  });
  server.put('/track/resume/:id', function(req, res, next) {
    Track.resume(() => {
      res.send(201);
    })
  });
  server.del('/track/:id', function(req, res, next) {
    Track.stop(() => {
      res.send(204);
    })
  });
};
