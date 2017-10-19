const fs = require('fs');
const Iwlist = require('wireless-tools/iwlist');

const Wawy = require('./wawy');
const Settings = require('../models/settings');

module.exports = {
  init: () => {
    console.log('Init settings');
    Wawy.serial((serial) => {
      console.log('Init setting for Wawy #', serial);
      if (serial) {
        const WaWySettings = new Settings({
          serial: serial,
          camera: {
            rotation: 90
          }
        });
        Settings.find({serial: serial}, (err, settings) => {
          if (err) return console.error(err);
          if(settings.length === 0) {
            WaWySettings.save((err, settings) => {
              if (err) console.log(err);
              console.log(settings);
            })
          }
        })
      } else {
        console.error('no serial');
      }
    })
  },

  get: (callback) => {
    Wawy.serial((serial) => {
      Settings.findOne({serial: serial}, (err, settings) => {
        if (err) return console.error(err);
        return callback(settings);
      })
    })
  },

  set: (settings, callback) => {
    Wawy.serial((serial) => {
      if (serial) {
        Settings.findOneAndUpdate({serial: serial}, {$set: settings}, (err, doc) => {
          return callback(err, doc);
        });
      }
    });
  },

  listWifi: (callback) => {
    Iwlist.scan('wlan0', function(err, networks) {
      return callback(networks);
    });
  },

  setWifi: (ssid, psk, callback) => { 
    const wpaSupplicant = '/etc/wpa_supplicant/wpa_supplicant.conf';
    fs.readFile(wpaSupplicant, 'utf8', (err, buffer) => {
      if(buffer) {
        fs.copyFile(wpaSupplicant, '/etc/wpa_supplicant/old_wpa_supplicant.conf', (err) => {
          if (err) throw err;

        });
        const newNetwork = `${buffer}\nnetwork={\n  ssid="${ssid}"\n  psk="${psk}"\t\n}`;
        fs.writeFile(wpaSupplicant, newNetwork, (err) => {
          if (err) throw err;
          callback(true);
        });
      } else {
        callback(false);
      }
    });
  }
}

