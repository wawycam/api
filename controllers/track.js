const Wawy = require('../controllers/wawy');
const Moment = require("moment");
const WaWyModel = require('../models/wawy');

module.exports = {
  set: (RTS, callback) => {
    const date = Moment().format('YYYY-MM-DD');
    const trackName =  `track-${date}`;
    Wawy.get((wawy) => {
      const track = {
        name: trackName,
        count: 0,
        geoDatas: [],
      }
      Wawy.pushSubdoc({"_id": wawy._id}, {tracks: track}, (err, result) => {
        if (result.ok) {
          WaWyModel.findOne({_id: wawy._id}, { tracks: 1}, (err, camera) => {
            const tracks = camera.tracks;
            const track = tracks.slice(-1).pop();
            Wawy.set({isTracking: true}, () => {});
            RTS.track(track._id, trackName);
            return callback(track._id, trackName);
          });
        }
      });
    });
  },
  setTrack: (trackId, geoData, callback) => {
    const startDate = new Date();
    Wawy.get((wawy) => {
      console.log('Get Wawy', new Date() - startDate);
      const track = wawy.tracks.filter((track) => {
        return String(track._id) == trackId; 
      }).pop()
      if (track) {
        console.log('Filter track', new Date() - startDate);
        let count = track.count + 1
        const updateFields = {
          "tracks.$.count": count, 
          "tracks.$.updatedAt": Moment(),
        }
        Wawy.setSubdoc({"tracks._id": track._id}, updateFields, (err, doc) => {
          console.log('Update counter', new Date() - startDate);
          if (err) console.log(err)
        });

        const geo = {
          accuracy: geoData.accuracy,
          altitude: geoData.altitude,
          heading: geoData.heading,
          speed: geoData.speed,
          location: {
            type: 'Point',
            coordinates: [geoData.latitude, geoData.longitude],
          },
        }
        geo.media = (geoData.media) ? geoData.media : null;
        Wawy.pushSubdoc({
          "tracks._id": track._id
        }, {
          "tracks.$.geoData": geo
        }, (err, doc) => {
          console.log('Set track Mongo Save process time', new Date() - startDate);
          return callback();
        });
      } else {
        console.log('No track found', new Date() - startDate);
        return callback();
      }
    });
  },
  resume: (callback) => {
    Wawy.set({isTracking: false}, () => {});
    return callback();
  },
  stop: (callback) => {
    Wawy.set({isTracking: false}, () => {});
    return callback();
  },
  delete: (trackId, callback) => {
    Wawy.get((wawy) => {
      Wawy.deleteSubdoc({"_id": wawy._id}, {"tracks": {"_id": trackId}}, (err, doc) => {
        return callback();
      });
    });
  }
}