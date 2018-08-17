const Async = require('async');
const Exec = require('child_process').exec;
const Proc = require('node-proc');
const Path = require('path');
const Diskspace = require('diskspace');
const git = require('simple-git/promise');

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

  version: async (repo, callback) => {
    const workingDirectory = (repo === 'ui') ? `${Path.resolve(__dirname, '../../ui')}` : './';
    try {
      const apiLocalLastCommitLog = await git(workingDirectory).log();
      callback({
        commit: apiLocalLastCommitLog.latest.hash,
        date: apiLocalLastCommitLog.latest.date,
        message: apiLocalLastCommitLog.latest.message,
      });
    }
    catch (e) {
      callback(e);
    }
  },

  checkForUpdate: async (repo, callback) => {
    const workingDirectory = (repo === 'ui') ? `${Path.resolve(__dirname, '../../ui')}` : './';
    const branch = (repo === 'ui') ? 'origin/master' : 'origin/develop';
    try {
      const apiRemoteLastCommitLog = await git(workingDirectory).raw(['log', '-1', branch]);
      const apiRemoteLastCommit = apiRemoteLastCommitLog.split('\n')[0].replace('commit ', '');
      
      const apiLocalLastCommitLog = await git(workingDirectory).log();
      const apiLocalLastCommit = apiLocalLastCommitLog.latest.hash;
      
      if (apiRemoteLastCommit !== apiLocalLastCommit) {
        callback('updateAvailable');
      } else {
        callback('latest');
      }
    }
    catch (e) {
      callback(e);
    }
  },

  applyUpdate: (repo, callback) => {
    const workingDirectory = (repo === 'ui') ? `${Path.resolve(__dirname, '../../ui')}` : './';
    require('simple-git')(workingDirectory)
      .pull((err, update) => {
        if (err) {
          callback(e);
        }
        if(update && update.summary.changes && repo === 'api') {
          require('child_process').exec('pm2 restart WaWyCam');
        }
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