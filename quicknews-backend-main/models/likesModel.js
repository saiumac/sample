const mongoose = require('mongoose');

const likesSchema = new mongoose.Schema(
  {
    news: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'News',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

likesSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'news',
    select: 'title',
  }).populate({
    path: 'user',
    select: 'name email',
  });

  next();
});

const likes = mongoose.model('Likes', likesSchema);

module.exports = likes;
