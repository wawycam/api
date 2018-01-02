const Async = require('async');
const Exec = require('child_process').exec;
const Proc = require('node-proc');
const Diskspace = require('diskspace');

module.exports = {
  serial: (callback) => {
    let serial = undefined;
    Proc.cpuinfo((err, cpuinfo) => {
      Async.eachSeries(cpuinfo, (info, cb) => {
        if(info.Serial) {
          serial = info.Serial;
        }
        cb();
      }, () => {
        callback({serial: serial})
      });
    });
  },

  info: (callback) => {
    const uptime = Proc.uptime((err, uptime, startTime) => {
      Diskspace.check('/', (err, result) => {
        const free = (result.free / 1073741824).toFixed(2)
        const total = (result.total / 1073741824).toFixed(2)
        callback({disk: { free, total}, uptime: startTime})
      });
    })
  },

  reboot: (callback) => {
    callback(true)
    setTimeout(() => {
      Exec('reboot');
    }, 1000);
  },

  halt: (callback) => {
    callback(true)
    setTimeout(() => {
      Exec('halt');
    }, 1000);
  }
}