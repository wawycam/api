const Config = require('../config');
const Service = require('../controllers/service');

module.exports = function(server) {
  server.get('/service/status', function(req, res, next) {
    res.json(200, 'alive');
  });
  server.get('/service/version', function(req, res, next) {
    Service.version(req.query.repo, (version) => {
      res.json(200, version);
    })
  });
  server.get('/service/info', function(req, res, next) {
    Service.info((info) => {
      res.json(200, info);
    })
  });
  server.get('/service/serial', function(req, res, next) {
    Service.serial((serial) => {
      res.json(200, serial);
    })
  });
  server.get('/service/update', function(req, res, next) {
    Service.checkForUpdate(req.query.repo, (status) => {
      res.send(200, status);
    })
  });
  server.post('/service/halt', function(req, res, next) {
    Service.halt(() => {
      res.send(201);
    })
  });
  server.post('/service/reboot', function(req, res, next) {
    Service.reboot((serial) => {
      res.send(201);
    });
  });
};

