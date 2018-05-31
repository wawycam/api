const Wawy = require('../controllers/wawy');
const Moment = require("moment");

module.exports = {
  set: (geoData, callback) => {
    const date = Moment().format('YYYY-MM-DD');
    Wawy.get((wawy) => {
      const track = {
        name: `track-${date}`,
        accuracy: geoData.accuracy,
        altitude: geoData.altitude,
        heading: geoData.heading,
        speed: geoData.speed,
        location: {
          type: 'Point',
          coordinates: [geoData.latitude, geoData.longitude],
        },
      }
      Wawy.pushSubdoc({"_id": wawy._id}, { track }, (err, doc) => {
        return callback('done');
      });
    });
  },
}