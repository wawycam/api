module.exports = function(server, wawy, sockets, RTS) {
  require('./gps')(server, sockets);
  require('./wawy')(server);
  require('./service')(server);
  require('./track')(server, RTS, sockets);
  require('./video')(server, wawy, RTS);
  require('./wifi')(server);
  require('./photo')(server, wawy, sockets, RTS);
};
