const restify = require('restify');
const restifyPlugins = require('restify-plugins');
const mongoose = require('mongoose');

const config = require('./config');
const Settings = require('./controllers/settings');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/wawy');

const server = restify.createServer({
  name: config.name,
  version: config.version
});

Settings.init();

server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());

server.listen(config.port, function () {
  require('./routes')(server);
  console.log(`Server ${server.name} is listening on port ${config.port}`);
}); 