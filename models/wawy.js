const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const WaWySchema = new mongoose.Schema(
	{
		serial: String,
		name: String,
		isBroadcasting: Boolean,
		isSnapping: Boolean,
		rotation: Number,
		timelapses: [{
			count: Number,
			name: String,
			photos: [{name: String}],
			status: String,
			updatedAt: Date,
		}]
	}
);

WaWySchema.plugin(timestamps);

const WaWy = mongoose.model('Camera', WaWySchema);
module.exports = WaWy;    