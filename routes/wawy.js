const errors = require('restify-errors');
const restify = require('restify');
const Wawy = require('../controllers/wawy');

module.exports = function(server) {

  server.get('/wawy', function(req, res, next) {
    Wawy.get((wawy) => {
      res.json(200, wawy);
    });
  });

  server.post('/wawy/name', function(req, res, next) {
    if (req.body && req.body.name) {
      Wawy.setname(req.body.name, (result) => {
        if (result) {
          res.send(201);
        } else {
          res.json(401, {error: 'no authorization' });
        }
      });
    } else {
      res.json(404, {error: 'bad or missing parameter' });
    }
  });

  server.post('/wawy/rotation', function(req, res, next) {
    const degree = parseInt(req.body.degree);
    if ([0, 90, 180, 270].indexOf(degree) > -1) {
      Wawy.set({rotation: degree}, (err, doc) => {
        if (err) {
          res.send(500)
        } else {
          res.send(201);
        }
      });
    } else {
      res.json(404, {error: 'bad or missing parameter: degree acceptable values are only 0, 90, 180, 270' });
    }
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