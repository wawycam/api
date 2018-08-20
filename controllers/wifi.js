const wifi = require('rpi-wifi-connection');
const Wifi = new wifi();
const Wawy = require('../controllers/wawy');

module.exports = {
  list: (callback) => {
    Wifi.scan().then((ssids) => {
      callback(ssids);
    })
  },

  enabled: (callback) => {
    Wifi.getNetworks().then((networks) => {
      callback(networks);
    });
  },

  set: (ssid, psk, callback) => {
    Wifi.connect({ssid: ssid, psk: psk}).then((res) => {
      callback(true)
    })
    .catch((error) => {
      callback(false)
    });
  },

  status: (callback) => {
    let counter = 0;
    const timeout = 30000;
    const maxTry = 10;
    const interval = setInterval(() => {
      if (counter < maxTry) {
        Wifi.getStatus().then((status) => {
          if (status && status.ssid) {
            callback(status);
            clearInterval(interval);  
          } else {
            counter++;
          }
        })
      } else {
        callback({statusCode: 408, ip: null});
        clearInterval(interval);
      }
    }, (timeout/maxTry));
  },
}