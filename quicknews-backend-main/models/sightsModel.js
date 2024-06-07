const mongoose = require('mongoose');

const SightSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
  },
  bgFile: {
    type: String,
    required: false,
  },
  files: [
      {
          filename: String,
          filePath: String
      }
  ],
  publishedDate: {
    type: Date,
    default: Date.now(),
  },
});


const Sight = mongoose.model('Sight', SightSchema);

module.exports = Sight;
