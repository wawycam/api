const errors = require('restify-errors');
const Settings = require('../controllers/settings');

module.exports = function(server) {
  
  server.get('/settings', function(req, res, next) {
    Settings.get((settings) => {
      res.json(200, { status: 200, settings });
    });
    next();
  });

  server.post('/settings/camera/rotation/:degree', function(req, res, next) {
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

  server.get('/settings/wifi', function(req, res, next) {
    Settings.listWifi((wifiList) => {
      res.send(200, {status: 200, list: wifiList});
    });
  });

  server.get('/settings/wifi/enable', function(req, res, next) {
    Settings.listEnableWifi((wifiList) => {
      res.send(200, {status: 200, list: wifiList});
    });
  });

  server.get('/settings/wifi/status', function(req, res, next) {
    Settings.getWifiStatus((status) => {
      res.send(status.statusCode, {status: status.statusCode, ip: status.ip});
    });
  });

  server.post('/settings/wifi', function(req, res, next) {
    Settings.setWifi(req.body.ssid, req.body.psk, (result) => {
      if (result) {
        res.send(201);
      } else {
        res.send(401, { status: 401, error: 'no authorization' });
      }
    });
  });

  server.post('/settings/name', function(req, res, next) {
    Settings.setHostname(req.body.name, (result) => {
      if (result) {
        res.send(201);
      } else {
        res.send(401, { status: 401, error: 'no authorization' });
      }
    });
  });
};