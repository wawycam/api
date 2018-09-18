module.exports = function(server, wawy, sockets, RTS) {
  require('./gps')(server, sockets);
  require('./photo')(server, wawy, sockets, RTS);
  require('./service')(server);
  require('./track')(server, RTS);
  require('./video')(server, wawy, RTS);
  require('./wawy')(server);
  require('./wifi')(server);
};
