module.exports = function(server, wawy, RTS) {
  require('./photo')(server, wawy, RTS);
  require('./service')(server);
  require('./track')(server);
  require('./video')(server, wawy);
  require('./wawy')(server);
  require('./wifi')(server);
};
