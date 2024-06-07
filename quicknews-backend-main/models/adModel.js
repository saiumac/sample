const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: false,
    trim: true,
  },
  publishedDate: {
    type: Date,
    default: Date.now(),
  },
  mediaType: {
    type: String,
    required: false,
    enum: ['Image', 'Video'],
  },
  source: {
    type: String,
    required: false,
  },
  chooseFile: {
    type: String,
    required: false,
  },
  isAd: {
    type: Boolean,
    required: true,
    default: true
  },
  publishedBy: {
    type: String,
    required: [false, 'Publisher is required'],
  },
  views: {
    type: Number,
    default: 0,
  },
});


const Ad = mongoose.model('Ad', AdSchema);

module.exports = Ad;
