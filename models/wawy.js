const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const WaWySchema = new mongoose.Schema(
	{
		serial: String,
		name: String,
		isBroadcasting: Boolean,
		isSnapping: Boolean,
		isRecording: Boolean,
		rotation: Number,
		isGeolocationEnable: Boolean,
		isAutoVideoEnable: Boolean,
		isAutoSnapEnable: Boolean,
		track:[{
			name: String,
			accuracy: Number,
			altitude: Number,
			heading: Number,
			speed: Number,
			createdAt: { type: Date, default: Date.now },
			location: {
				type: { type: String },
				coordinates: [],
			},
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