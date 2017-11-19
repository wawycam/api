const restify = require('restify');
const restifyPlugins = require('restify-plugins');
const corsMiddleware = require('restify-cors-middleware')
const mongoose = require('mongoose');

const config = require('./config');
const Settings = require('./controllers/settings');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/wawy');

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

Settings.init();

server.pre(cors.preflight);
server.use(cors.actual);
server.use(restifyPlugins.bodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());

server.listen(config.port, function () {
  require('./routes')(server);
  console.log(`Server ${server.name} is listening on port ${config.port}`);
}); 