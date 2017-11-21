module.exports = function(server) {
  require('./photo')(server);
  require('./service')(server);
  require('./video')(server);
  require('./wawy')(server);

  require('./version')(server);
  require('./live')(server);
  require('./snap')(server);
  require('./settings')(server);
};
