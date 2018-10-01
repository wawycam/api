const Track = require('../controllers/track');

module.exports = function(server, RTS, sockets) {
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
  server.del('/track/:id/delete', function(req, res, next) {
    Track.delete(req.params.id, () => {
      res.send(204);
    })
  });
  server.get('/track/sync/:trackId/:serial', async function(req, res, next) {
    const Track = await RTS.syncTrack(req.params.trackId, req.params.serial);
    res.json(200, Track);
  });
  server.post('/track/sync/:trackId/:serial', function(req, res, next) {
    RTS.uploadTrack(req.params.trackId, req.params.serial, req.body.geoData, sockets);
  });
};
