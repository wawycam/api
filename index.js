const restify = require('restify');
const restifyPlugins = require('restify-plugins');
const corsMiddleware = require('restify-cors-middleware')
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

module.exports = server.listen(config.port, function () {
  require('./routes')(server);
  
  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://localhost/wawy', { useMongoClient: true} );
  
  const db = mongoose.connection;

  db.on('error', (err) => {
    console.error(err);
  });

  db.once('open', () => {
    WaWy.init(() => {
      Logger.info(`Server ${server.name} is listening on port ${config.port}`);
    })
  });

});

