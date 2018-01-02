const Config = require('../config');
const Video = require('../controllers/video');

module.exports = function(server) {
  server.post('/video/broadcast', function(req, res, next) {
    Video.startBroadcasting((isStarted) => {
      if (isStarted) {
        res.json(200, {
          url: { 
            local:'http://wawycam.local/live/index.m3u8', 
            remote:'http://78.193.122.79/live/index.m3u8'
          }
        });
      } else {
        res.send(404);
      }
    });   
  });
  server.del('/video/broadcast', function(req, res, next) {
    Video.stopBroadcasting((isStopped) => {
      if (isStopped) {
        res.send(204);
      } else {
        res.send(404);
      }
    })
  });
};

