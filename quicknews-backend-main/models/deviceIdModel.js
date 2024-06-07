const mongoose = require('mongoose');

const deviceIdSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: false,
  },
});

const DeviceId = mongoose.model('DeviceId', deviceIdSchema);

module.exports = DeviceId;
