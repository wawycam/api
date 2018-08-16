const Wifi = require('../controllers/wifi');

module.exports = function(server, RTS) {

  server.get('/wifi', function(req, res, next) {
    Wifi.list((wifiList) => {
      res.json(200, {list: wifiList});
    });
  });

  server.get('/wifi/enabled', function(req, res, next) {
    Wifi.enabled((wifiList) => {
      res.json(200, {list: wifiList});
    });
  });

  server.get('/wifi/status', function(req, res, next) {
    Wifi.status(RTS, (status) => {
      res.json(200, status);
    });
  });

  server.post('/wifi', function(req, res, next) {
    const ssid = req.body.ssid;
    const psk = req.body.psk;
    if (ssid && psk) {
      Wifi.set(ssid, psk, (result) => {
        if (result) {
          res.send(201);
        } else {
          res.json(401, { status: 401, error: 'no authorization' });
        }
      });
    }
  });
};