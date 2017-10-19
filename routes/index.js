module.exports = function(server) {
  require('./version')(server);
  require('./live')(server);
  require('./snap')(server);
  require('./settings')(server);
};
