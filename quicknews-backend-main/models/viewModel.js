const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({
  adId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: false,
  },
  shortId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Short',
    required: false,
  },
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote',
    required: false,
  },
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: false,
  },
  deviceId: {
    type: String,
    required: false,
  },
});

const View = mongoose.model('View', viewSchema);

module.exports = View;
