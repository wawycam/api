const async = require('async');
const Proc = require('node-proc');
const exec = require('child_process').exec;
const diskspace = require('diskspace');
const QRCode = require('qrcode');
const Settings = require('../models/settings');

const Self = module.exports = {
  serial: (callback) => {
    let serial = undefined;
    Proc.cpuinfo((err, cpuinfo) => {
      async.eachSeries(cpuinfo, (info, cb) => {
        if(info.Serial) {
          serial = info.Serial;
        }
        cb();
      }, () => {
        callback(serial)
      });
    });
  },

  info: (callback) => {
    const uptime = Proc.uptime((err, uptime, startTime) => {
      diskspace.check('/', (err, result) => {
        const free = (result.free / 1073741824).toFixed(2)
        const total = (result.total / 1073741824).toFixed(2)
        callback({disk: { free, total}, uptime: startTime})
      });
    })
  },

  generateQrCode: (callback) => {
    Self.serial((serial) => {
      Settings.findOne({serial: serial}, (err, settings) => {
        if (err) return console.error(err);
        const url = `http://${settings.name}.local`
        QRCode.toFile('./public/qrcode.svg',  url, (err) => {
          if (err) throw err
          callback(201)
        })
      })
    });
  },

  reboot: (callback) => {
    callback(true)
    setTimeout(() => {
      exec('reboot');
    }, 1000);
  }
}