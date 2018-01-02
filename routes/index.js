module.exports = function(server) {
  require('./photo')(server);
  require('./service')(server);
  require('./video')(server);
  require('./wawy')(server);
  require('./wifi')(server);
};
