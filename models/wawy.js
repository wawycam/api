const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const WaWySchema = new mongoose.Schema(
	{
		serial: String,
		name: String,
		isBroadcasting: Boolean,
		isSnapping: Boolean,
		isRecording: Boolean,
		isTracking: Boolean,
		rotation: Number,
		isGeolocationEnable: Boolean,
		isAutoVideoEnable: Boolean,
		isAutoSnapEnable: Boolean,
		tracks:[{
			name: String,
			count: Number,
			createdAt: { type: Date, default: Date.now },
			updatedAt: { type: Date, default: Date.now },
			geoData: [{
				accuracy: Number,
				altitude: Number,
				createdAt: { type: Date, default: Date.now },
				heading: Number,
				location: {
					type: { type: String },
					coordinates: [],
				},
				speed: Number,
				media: {
					file: String,
					type: { type: String },
				}
			}],
		}],
		timelapses: [{
			count: Number,
			name: String,
			photos: [{name: String}],
			status: String,
			updatedAt: Date,
		}]
	}
);

WaWySchema.index({ 'track.location': '2dsphere' });
WaWySchema.plugin(timestamps);

const WaWy = mongoose.model('Camera', WaWySchema);
module.exports = WaWy;

module.exports.toObjectId = string => mongoose.Types.ObjectId(string);