const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  language: {
    type: String,
    unique: true,
    required: true,
  },
});

languageSchema.pre(/^find/, function (next) {
  this.select('-__v');

  next();
});

const Language = mongoose.model('Language', languageSchema);
module.exports = Language;
