const mongoose = require('mongoose');
const moment = require('moment-timezone'); // Assuming moment-timezone is imported
const slugify = require('slugify');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    // unique: [true, 'Title already exists. Please choose another title'],
    // trim: true,
  },
  summary: {
    type: String,
    required: [true, 'The news must have a summary'],
    trim: true,
  },
  publishedDate: {
    type: String,
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
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [false, 'Invalid Category'],
  },
  language: {
    type: mongoose.Schema.ObjectId,
    ref: 'Language',
    required: [false, 'Invalid Language'],
  },
  publishedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [false, 'Publisher is required'],
  },
  place: {
    type: mongoose.Schema.ObjectId,
    ref: 'Place',
    required: [false, 'Place is required'],
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: Number,
    default: 0,
  },
  subcomments: {
    type: Number,
    default: 0,
  },
  isNews: {
    type: Boolean,
    required: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  isAdd: {
    type: Boolean,
    required: false,
  },
  isQuotate: {
    type: Boolean,
    required: false,
  },
  isVerified: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    required: true,
  },
}, { timestamps: true }); 

const News = mongoose.model('News', newsSchema);

module.exports = News;
