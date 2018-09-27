const restify = require('restify');
const socketio = require('socket.io');
const restifyPlugins = require('restify-plugins');
const corsMiddleware = require('restify-cors-middleware')
const mongoose = require('mongoose');
const Logger = require('./utils/logger');
const config = require('./config');
const WaWy = require('./controllers/wawy');
const Wifi = require('./controllers/wifi');
const Service = require('./controllers/service');
const RTS = require('../RTS-Client/lib')();

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ['*'],
  allowHeaders: ['GET', 'POST', 'Authorization'],
})

const server = restify.createServer({
  name: config.name,
  version: config.version,
  acceptable: ['application/json', 'image/png']
});

const io = socketio.listen(server.server);

const cleanExit = () => {
  WaWy.set({
    isSnapping: false,
    isRecording: false,
    isTracking: false,
    isBroadcasting: false,
  }, () => {
    return process.exit(0);
  });
}

server.pre(cors.preflight);
server.use(cors.actual);
server.use(restifyPlugins.bodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());
server.use(RTS.listen);

module.exports = server.listen(config.port, function () {
  
  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://localhost/wawy', { useMongoClient: true} );
  
  const db = mongoose.connection;

  db.on('error', (err) => {
    console.error(err);
  });

  db.once('open', () => {
    WaWy.init((wawy) => {
      RTS.connect(wawy.serial);
      RTS.set(wawy.serial);
      Wifi.status((status) => {
        Logger.info(`Wawy Camera connected on Wifi "${status.ssid}" with Local IP set to "${status.ip_address}"`);
        RTS.setCameraIp(wawy.serial, status.ip_address);
        // Auto check for RTS-Client UPDATE
        Service.checkForUpdate('RTS', (status) => {
          Logger.verbose(`RTS status update: ${status}`);
          if (status === 'updateAvailable') {
            Logger.info(`RTS status update: ${status}`);
            Service.applyUpdate('RTS', (status) => {
              Logger.info(`RTS is upadated: ${status}`);
            });
          }
        });
      });
      require('./routes')(server, wawy, io.sockets, RTS);
      Logger.info(`Server ${server.name} is listening on port ${config.port}`);
    })
  });

});

process.on('SIGTERM', cleanExit);
process.on('SIGINT', cleanExit);
process.stdin.resume();

