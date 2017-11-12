const errors = require('restify-errors');
const Wawy = require('../controllers/wawy');
const restify = require('restify');

module.exports = function(server) {
  server.post('/wawy/reboot', function(req, res, next) {
    Wawy.reboot(() => {
      res.send(201);
    })
  });

  server.post('/wawy/halt', function(req, res, next) {
    Wawy.halt(() => {
      res.send(201);
    })
  });
  
  server.get('/wawy/serial', function(req, res, next) {
    Wawy.serial((serial) => {
      res.send(200, {status: 200, id: serial});
    });
  });

  server.get('/wawy/info', function(req, res, next) {
    Wawy.info((info) => {
      res.send(200, {status: 200, info: info});
    });
  });

  server.post('/wawy/qrcode', function(req, res, next) {
    Wawy.generateQrCode(() => {
      res.send(201);
    });
  });

  server.get('/wawy/qrcode.svg', restify.plugins.serveStatic({
    appendRequestPath: false,
    directory: './public',
 }));

};