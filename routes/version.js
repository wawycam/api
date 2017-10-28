const config = require('../config');

module.exports = function(server) {
  server.get('/ping', function(req, res, next) {
    res.json(200, 'pong');
    return next();
  });
  server.get('/version', function(req, res, next) {
    res.json({version: config.version});
    return next();
  });
};
