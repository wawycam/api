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
      console.log(res);
      callback(true)
    })
    .catch((error) => {
      console.log(error);
      callback(false)
    });
  },

  status: (RTS, callback) => {
    let counter = 0;
    const timeout = 30000;
    const maxTry = 10;
    const interval = setInterval(() => {
      if (counter < maxTry) {
        Wifi.getStatus().then((status) => {
          if (status && status.ssid) {
            callback(status);
            clearInterval(interval);  
            // Wawy.get((wawy) => {
            //   const camera = {
            //     name: wawy.name,
            //     serial: wawy.serial,
            //     ip: status.ip_address,
            //   };
            //   RTS.camera('updateOrRegister:camera', null, camera);
            // });
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