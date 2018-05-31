module.exports = function(server, wawy) {
  require('./photo')(server, wawy);
  require('./service')(server);
  require('./track')(server);
  require('./video')(server, wawy);
  require('./wawy')(server);
  require('./wifi')(server);
};
