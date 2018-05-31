const restify = require('restify');
const restifyPlugins = require('restify-plugins');
const corsMiddleware = require('restify-cors-middleware')
const socketio = require('socket.io');
const mongoose = require('mongoose');
const Logger = require('./utils/logger');
const config = require('./config');
const WaWy = require('./controllers/wawy');

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ['*'],
  allowHeaders: ['GET', 'POST'],
})

const server = restify.createServer({
  name: config.name,
  version: config.version,
  acceptable: ['application/json', 'image/png']
});

server.pre(cors.preflight);
server.use(cors.actual);
server.use(restifyPlugins.bodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());

const io = socketio(server.server);

io.on('connection', function(socket) {
  console.log('Someone is connnecting !');
  socket.emit('msg', { msg: 'world' });
  socket.on('my other event', function(data) {
      console.log(data);
  });
});

module.exports = server.listen(config.port, function () {
  
  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://localhost/wawy', { useMongoClient: true} );
  
  const db = mongoose.connection;

  db.on('error', (err) => {
    console.error(err);
  });

  db.once('open', () => {
    WaWy.init((wawy) => {
      require('./routes')(server, wawy);
      Logger.info(`Server ${server.name} is listening on port ${config.port}`);
    })
  });

});

