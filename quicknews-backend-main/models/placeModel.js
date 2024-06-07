const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  place: {
    type: String,
    required: true,
    unique: true,
  },
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
