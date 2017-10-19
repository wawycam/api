const errors = require('restify-errors');
const Settings = require('../controllers/settings');

module.exports = function(server) {
  
  server.get('/settings', function(req, res, next) {
    Settings.get((settings) => {
      res.json(200, { status: 200, settings });
    });
    next();
  });

  server.get('/settings/camera/rotation/:degree', function(req, res, next) {
    Settings.set({camera: { rotation: parseInt(req.params.degree) }}, (err, doc) => {
      if (err) {
        console.log(err);
        res.send(500)
      } else {
        res.send(201);
        next();
      }
    })
  });

  server.get('/settings/wifi/list', function(req, res, next) {
    Settings.listWifi((wifiList) => {
      res.send(200, {status: 200, list: wifiList});
    });
  });

  server.post('/settings/wifi/set', function(req, res, next) {
    Settings.setWifi(req.body.ssid, req.body.psk, (result) => {
      if (result) {
        res.send(201);
      } else {
        res.send(401, { status: 401, error: 'no authorization' });
      }
    });
  });
};