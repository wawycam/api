const Logger = require('../utils/logger');
const Setup = require('setup')();
const Exec = require('child_process').exec;
const Service = require('../controllers/service');
const QRCode = require('qrcode');
const WaWyModel = require('../models/wawy');

const Self = module.exports = {
  init: (callback) => {
    Logger.log('verbose', 'Init WaWy')
    Service.serial((serial) => {
      Logger.log('verbose', 'Initialisation of Wawy # %s', serial.serial);
      if (serial) {
        const WaWySettings = new WaWyModel({
          serial: serial.serial,
          name: 'wawycam',
          rotation: 90
        });
        WaWyModel.find({serial: serial.serial}, (err, wawy) => {
          if (err) return console.error(err);
          if(wawy.length === 0) {
            WaWySettings.save((err, wawy) => {
              if (err) console.log(err);
              callback(wawy);
            })
          } else {
            callback(wawy);
          }
        })
      } else {
        Logger.log('error', 'No serial');
        callback(false);
      }
    })
  },

  setname: (name, callback) => {
    Setup.hostname.save(name);
    const cmd = `sudo -- sh -c -e "echo '127.0.0.1   ${name}' >> /etc/hosts";`;
    Exec(cmd);
    Self.set({name: name}, (err, doc) => {
      if (!err) {
        callback(true);
      }
    })
  },

  generateQrCode: (callback) => {
    Service.serial((serial) => {
      WaWyModel.findOne({serial: serial.serial}, (err, wawy) => {
        if (err) return console.error(err);
        const url = `http://${wawy.name}.local`
        QRCode.toFile('./public/qrcode.svg',  url, (err) => {
          callback(201)
        })
      })
    });
  },

  /*DB OPERATION */

  get: (callback) => {
    Service.serial((serial) => {
      WaWyModel.findOne({serial: serial.serial}, (err, camera) => {
        if (err) return console.error(err);
        callback(camera);
      })
    })
  },

  set: (settings, callback) => {
    Service.serial((serial) => {
      if (serial) {
        WaWyModel.findOneAndUpdate({serial: serial.serial}, {$set: settings}, (err, doc) => {
          callback(err, doc);
        });
      }
    });
  },

  setSubdoc: (subDocCriteria, settings, callback) => {
    Service.serial((serial) => {
      if (serial) {
        const SerialCriteria = {serial: serial.serial};
        const criteria  = Object.assign(SerialCriteria, subDocCriteria);
        WaWyModel.findOneAndUpdate(criteria, {$set: settings}, (err, doc) => {
          callback(err, doc);
        });
      }
    });
  },

  pushSubdoc: (subDocCriteria, datas, callback) => {
    Service.serial((serial) => {
      if (serial) {
        const SerialCriteria = {serial: serial.serial};
        const criteria  = Object.assign(SerialCriteria, subDocCriteria);
        WaWyModel.update(criteria, {$push: datas}, (err, doc) => {
          callback(err, doc);
        });
      }
    });
  },

  deleteSubdoc: (subDocCriteria, toDelete, callback) => {
    Service.serial((serial) => {
      if (serial) {
        const SerialCriteria = {serial: serial.serial};
        const criteria  = Object.assign(SerialCriteria, subDocCriteria);
        WaWyModel.update(criteria, {$pull: toDelete}, (err, doc) => {
          callback(err, doc);
        });
      }
    });
  },
}
