const Logger = require('../utils/logger');
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

  changeLog: async (repo, callback) => {
    const workingDirectory = (repo === 'ui') ? `${Path.resolve(__dirname, '../../ui')}` : './';
    try {
      const changeLog = await git(workingDirectory).log();
      callback(changeLog.all);
    }
    catch (e) {
      callback(e);
    }
  },

  checkForUpdate: async (repo, callback) => {
    let workingDirectory = './';
    let branch = 'origin/develop';
    switch (repo) {
      case "ui":
        workingDirectory = `${Path.resolve(__dirname, '../../ui')}`;
        branch = 'origin/master';
        break;
      case "RTS":
        workingDirectory = `${Path.resolve(__dirname, '../../RTS-Client')}`;
        branch = 'origin/master';  
    }
    // const workingDirectory = (repo === 'ui') ? `${Path.resolve(__dirname, '../../ui')}` : './';
    // const branch = (repo === 'ui') ? 'origin/master' : 'origin/develop';
    try {
      const fetch = await git(workingDirectory).fetch();
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
    let workingDirectory = './';
    let branch = 'develop';
    switch (repo) {
      case "ui":
        workingDirectory = `${Path.resolve(__dirname, '../../ui')}`;
        branch = 'master';
        break;
      case "RTS":
        workingDirectory = `${Path.resolve(__dirname, '../../RTS-Client')}`;
        branch = 'master';  
    }
    require('simple-git')(workingDirectory)
      .pull('origin', branch, (err, update) => {
        if (err) {
          callback(e);
        }
        if(update && update.summary.changes) {
          if (repo === 'api') {
            const Exec = require('child_process').exec;
            const Restart = Exec('npm install && pm2 restart WaWyCam');
            Restart.stderr.on('data', (data) => {
              Logger.log('verbose', data.trim());
            });
            Restart.stdout.on('data', (data) => {
              Logger.log('verbose', data.trim());
            });
            Restart.on('exit', (code, signal) => {
              console.log('child process exited with ' + `code ${code} and signal ${signal}`);
              callback('ok');
            });
          } else if (repo === 'RTS') {
            const Exec = require('child_process').exec;
            const Restart = Exec('pm2 restart WaWyCam');
            Restart.stderr.on('data', (data) => {
              Logger.log('verbose', data.trim());
            });
            Restart.stdout.on('data', (data) => {
              Logger.log('verbose', data.trim());
            });
            Restart.on('exit', (code, signal) => {
              console.log('child process exited with ' + `code ${code} and signal ${signal}`);
              callback('ok');
            });
          }
        } else {
          callback('ok');
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