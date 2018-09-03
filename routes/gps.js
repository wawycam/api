const restify = require('restify');
const Gps = require('../controllers/gps');

module.exports = function(server, RTS) {

  server.get('/gps', function(req, res, next) {
    Gps.currentPosition((geodata) => {
      res.json(200, { geodata });
      return next();
    });
  });

  server.post('/gps', function(req, res, next) {
    Gps.start((status) => {
      if (status) {
        res.send(201);
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