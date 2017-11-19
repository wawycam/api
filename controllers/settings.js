const fs = require('fs');
const exec = require('child_process').exec;
const _ = require('lodash');
const Iwlist = require('wireless-tools/iwlist');
const wpa_cli = require('wireless-tools/wpa_cli');
const wpa_supplicant = require('wireless-tools/wpa_supplicant');
const iwconfig = require('wireless-tools/iwconfig');

const Wawy = require('./wawy');
const Settings = require('../models/settings');
const Setup = require('setup')();

const getMatches = (string, regex, index) => {
  const matches = [];
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
};


module.exports = {
  init: () => {
    console.log('Init settings');
    Wawy.serial((serial) => {
      console.log('Init setting for Wawy #', serial);
      if (serial) {
        const WaWySettings = new Settings({
          serial: serial,
          name: 'wawycam',
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

  setSubdoc: (subDocCriteria, settings, callback) => {
    Wawy.serial((serial) => {
      if (serial) {
        const SerialCriteria = {serial: serial};
        const criteria  = Object.assign(SerialCriteria, subDocCriteria);
        console.log(criteria);
        Settings.findOneAndUpdate(criteria, {$set: settings}, (err, doc) => {
          return callback(err, doc);
        });
      }
    });
  },

  pushSubdoc: (subDocCriteria, datas, callback) => {
    Wawy.serial((serial) => {
      if (serial) {
        const SerialCriteria = {serial: serial};
        const criteria  = Object.assign(SerialCriteria, subDocCriteria);
        Settings.update(criteria, {$push: datas}, (err, doc) => {
          return callback(err, doc);
        });
      }
    });
  },

  deleteSubdoc: (subDocCriteria, toDelete, callback) => {
    Wawy.serial((serial) => {
      if (serial) {
        const SerialCriteria = {serial: serial};
        const criteria  = Object.assign(SerialCriteria, subDocCriteria);
        Settings.update(criteria, {$pull: toDelete}, (err, doc) => {
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

  listEnableWifi: (callback) => {
    const wpaSupplicant = '/etc/wpa_supplicant/wpa_supplicant.conf';
    fs.readFile(wpaSupplicant, 'utf8', (err, buffer) => {
      if(buffer) {
        const match = buffer.match(/ssid=\"(.*)\"/gi);
        const myRegEx = /ssid=\"(.*)\"/gi;
        const list = getMatches(buffer, myRegEx, 1);
        const ssids = [];
        iwconfig.status((err, status) => {
          _.each(list, (ssid) => {
            if (status[0].ssid === ssid) {
              ssids.push({ ssid: ssid, isCurrent: true });
            } else {
              ssids.push({ ssid: ssid, isCurrent: false });
            }
          });
          callback(ssids);
        });
      }
    });
  },

  setWifi: (ssid, psk, callback) => {
    // note: possible use of this command line "wpa_passphrase "potato" "chewbacca" | sudo tee -a /etc/wpa_supplicant/wpa_supplicant.conf > /dev/null"
    const wpaSupplicant = '/etc/wpa_supplicant/wpa_supplicant.conf';
    fs.readFile(wpaSupplicant, 'utf8', (err, buffer) => {
      if(buffer) {
        fs.copyFile(wpaSupplicant, '/etc/wpa_supplicant/old_wpa_supplicant.conf', (err) => {
          if (err) throw err;

        });
        const newNetwork = `${buffer}\nnetwork={\n  ssid="${ssid}"\n  psk="${psk}"\t\n}`;
        fs.writeFile(wpaSupplicant, newNetwork, (err) => {
          if (err) throw err;
          const wpaCli = exec('wpa_cli -i wlan0 reconfigure');
          wpaCli.stdout.on('data', (data) => {
            console.log(data.trim());
          });
          callback(true);
        });
      } else {
        callback(false);
      }
    });
  },

  getWifiStatus: (callback) => {
    let counter = 0;
    const timeout = 30000;
    const maxTry = 10;
    const interval = setInterval(() => {
      if (counter < maxTry) {
        const wpaCli = exec('ifconfig wlan0 | grep "inet adr" | awk -F: \'{print $2}\' | awk \'{print $1}\'');
        wpaCli.stdout.on('data', (data) => {
          const ip = data.trim();
          callback({statusCode: 200, ip});
          clearInterval(interval);
        });
        counter++;
      } else {
        callback({statusCode: 408, ip: null});
        clearInterval(interval);
      }
    }, (timeout/maxTry));
  },

  setHostname: (name, callback) => {
    Setup.hostname.save(name);
    exec(`'sudo -- sh -c -e "echo \'127.0.1.1        ${name}\' >> /etc/hosts"`);
    callback(true);
  }
}

