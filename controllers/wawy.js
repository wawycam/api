const async = require('async');
const Proc = require('node-proc');

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
  }
}