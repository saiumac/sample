const mongoose = require('mongoose');
const slugify = require('slugify');

const ShortSchema = new mongoose.Schema({
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
  isShort: {
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


const Short = mongoose.model('Short', ShortSchema);

module.exports = Short;
