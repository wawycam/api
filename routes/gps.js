const restify = require('restify');
const Gps = require('../controllers/gps');

module.exports = function(server, RTS) {

  server.get('/gps', function(req, res, next) {
    Gps.currentPosition((geodata) => {
      res.send(200, { geodata });
    });
  });

  server.post('/gps', function(req, res, next) {
    Gps.start(req.body.trackId, RTS, (status) => {
      if (status) {
        res.send(200);
      } else {
        res.send(404);
      }
    });
  });

  server.del('/gps', function(req, res, next) {
    Gps.stop(() => {
      res.send(204);
    });
  });

};