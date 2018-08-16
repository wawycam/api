module.exports = function(server, wawy, RTS) {
  require('./gps')(server, RTS);
  require('./photo')(server, wawy, RTS);
  require('./service')(server);
  require('./track')(server, RTS);
  require('./video')(server, wawy, RTS);
  require('./wawy')(server);
  require('./wifi')(server, RTS);
};
