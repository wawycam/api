const async = require('async');
const Proc = require('node-proc');
const exec = require('child_process').exec;
const diskspace = require('diskspace');


module.exports = {
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

  reboot: (callback) => {
    callback(true)
    setTimeout(() => {
      exec('reboot');
    }, 1000);
  }
}