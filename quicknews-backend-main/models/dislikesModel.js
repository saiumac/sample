const mongoose = require('mongoose');

const dislikesSchema = new mongoose.Schema(
  {
    news: {
      type: mongoose.Schema.ObjectId,
      ref: 'News',
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

dislikesSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'news',
    select: 'title',
  }).populate({
    path: 'user',
    select: 'name email',
  });

  next();
});

const Dislikes = mongoose.model('Dislikes', dislikesSchema);

module.exports = Dislikes;
