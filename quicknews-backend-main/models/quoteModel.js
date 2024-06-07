const mongoose = require('mongoose');
const slugify = require('slugify');

const QuoteSchema = new mongoose.Schema({
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
  isQuote: {
    type: Boolean,
    required: true,
    default: true
  },
  share_count: {
    type: String,
    default: 0
  },
  publishedBy: {
    type: Number,
    required: [false, 'Publisher is required'],
  },
  views: {
    type: Number,
    default: 0,
  },
});


const Quote = mongoose.model('Quote', QuoteSchema);

module.exports = Quote;
