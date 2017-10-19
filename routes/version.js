const config = require('../config');

module.exports = function(server) {
  server.get('/version', function(req, res, next) {
    res.json({version: config.version});
    return next();
  });
};
