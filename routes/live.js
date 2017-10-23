const errors = require('restify-errors');
const Picam = require('../controllers/picam');

module.exports = function(server) {

  server.get('/live/start', (req, res, next) => {
    //-- Should start PICAM
    Picam.start((isStarted) => {
      if (isStarted) {
        res.json(200, {status: 200, 
          url: { 
            local:'http://wawycam.local/live/index.m3u8', remote:'http://78.193.122.79/live/index.m3u8'
          }
        });
      } else {
        res.json(400, {status: 400});
      }
      return next();
    });   
  });

  server.get('/live/stop', (req, res, next) => {
    //-- Should stop PICAM
    Picam.stop( () => {
      res.json(200, {status: 200});
      return next();
    });
  });
};

