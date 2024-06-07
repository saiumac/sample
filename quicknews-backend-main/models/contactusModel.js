const mongoose = require('mongoose');

const contactusSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
  },
});

const Contactus = mongoose.model('Contactus', contactusSchema);

module.exports = Contactus;
