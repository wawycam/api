const mongoose = require('mongoose');
mongoose.set('debug', true);
const timestamps = require('mongoose-timestamp');

const SettingsSchema = new mongoose.Schema(
	{
		serial: String,
		name: String,
		isBroadcasting: Boolean,
		isSnaping: Boolean,
		timelapses: [{
			name: String,
			updatedAt: Date,
			count: Number,
		}],
		camera: {
			rotation: {
				type: Number,
				required: false
			}
		}
	}
);

SettingsSchema.plugin(timestamps);

const Settings = mongoose.model('Settings', SettingsSchema);
module.exports = Settings;    