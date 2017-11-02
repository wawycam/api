const errors = require('restify-errors');
const Wawy = require('../controllers/wawy');

module.exports = function(server) {
  server.post('/wawy/reboot', function(req, res, next) {
    Wawy.reboot(() => {
      res.send(201);
    })
  });
  
  server.get('/wawy/info', function(req, res, next) {
    Wawy.info((info) => {
      res.send(200, {status: 200, info: info});
    });
  });

};