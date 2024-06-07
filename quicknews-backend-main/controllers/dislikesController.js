const Likes = require('../models/likesModel');
const Dislikes = require('../models/dislikesModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const News = require('../models/newsModel');

exports.createDislike = catchAsync(async (req, res, next) => {
  const { news } = req.body;
  const userId = req.user.id;

  try {
    const existingLike = await Likes.findOneAndDelete({
      news: news,
      user: userId,
    });

    const existingDislike = await Dislikes.findOne({
      news: news,
      user: userId,
    });

    let message;
    let likesCount;
    let dislikesCount;

    if (existingLike) {
      await existingLike.deleteOne();

      const updatedNewsRemoveLike = await News.findByIdAndUpdate(
        news,
        { $inc: { likes: -1 } },
        { new: true }
      );

      if (!updatedNewsRemoveLike) {
        throw new Error('News not found');
      }

      likesCount = Math.max(0, updatedNewsRemoveLike.likes);

      await Dislikes.create({
        news: news,
        user: userId,
      });

      const updatedNewsAddDislike = await News.findByIdAndUpdate(
        news,
        { $inc: { dislikes: 1 } },
        { new: true }
      );

      if (!updatedNewsAddDislike) {
        throw new Error('News not found');
      }

      dislikesCount = updatedNewsAddDislike.dislikes;
      message = 'You removed your like and disliked this news';
    } else if (existingDislike) {
      await existingDislike.deleteOne();

      const updatedNewsRemoveDislike = await News.findByIdAndUpdate(
        news,
        { $inc: { dislikes: -1 } },
        { new: true }
      );

      if (!updatedNewsRemoveDislike) {
        throw new Error('News not found');
      }

      dislikesCount = Math.max(0, updatedNewsRemoveDislike.dislikes);
      message = 'You undisliked this news';
    } else {
      await Dislikes.create({
        news: news,
        user: userId,
      });

      const updatedNewsAddDislike = await News.findByIdAndUpdate(
        news,
        { $inc: { dislikes: 1 } },
        { new: true }
      );

      if (!updatedNewsAddDislike) {
        throw new Error('News not found');
      }

      dislikesCount = updatedNewsAddDislike.dislikes;
      message = 'You disliked this news';
    }

    const updatedNewsCounts = await News.findById(news);

    if (!updatedNewsCounts) {
      throw new Error('News not found');
    }

    likesCount = updatedNewsCounts.likes || 0;

    console.log('Likes count after dislike operation:', likesCount);
    console.log('Dislikes count after dislike operation:', dislikesCount);

    res.status(201).json({
      status: 'success',
      message: message,
      likes: likesCount,
      dislikes: dislikesCount,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// exports.getDislikedNewsByUser = catchAsync(async (req, res, next) => {
//   const { userId } = req.user;

//   try {
//     // Retrieve the disliked news by the user
//     const dislikedNews = await Dislike.find({ user: userId }).populate('news');

//     res.status(200).json({
//       status: 'success',
//       dislikedNews, // Corrected variable name
//     });
//   } catch (error) {
//     return next(error); // Pass the error to the global error handler
//   }
// });

exports.getDislikedNewsByUser = catchAsync(async (req, res, next) => {
  const { newsId } = req.params;

  try {
    const newsExists = await News.exists({ _id: newsId });

    if (!newsExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'News not found.',
      });
    }

    const dislikedUsers = await Dislikes.find({ news: newsId }).populate({
      path: 'user',
      select: 'name email',
    });

    const dislikedUsersCount = dislikedUsers.length;

    res.status(200).json({
      status: 'success',
      dislikedUsersCount,
      dislikedUsers,
    });
  } catch (error) {
    return next(error);
  }
});
