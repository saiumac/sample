const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
      required: [true, 'review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// feedbackSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'user',
//     select: 'name',
//   });

//   next();
// });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
