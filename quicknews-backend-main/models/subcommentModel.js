const mongoose = require('mongoose');

const subcommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },

    comment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Subcomment = mongoose.model('Subcomment', subcommentSchema);

module.exports = Subcomment;
