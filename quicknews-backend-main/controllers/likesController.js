const Likes = require('../models/likesModel');
const Dislikes = require('../models/dislikesModel');
const catchAsync = require('../utils/catchAsync');
const News = require('../models/newsModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

exports.createLike = catchAsync(async (req, res, next) => {
  const { news } = req.body;
  const userId = req.user.id;

  try {
    const existingDislike = await Dislikes.findOneAndDelete({
      news: news,
      user: userId,
    });

    const existingLike = await Likes.findOne({
      news: news,
      user: userId,
    });

    let message;
    let likesCount;
    let dislikesCount;

    if (existingDislike) {
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

      await Likes.create({
        news: news,
        user: userId,
      });

      const updatedNewsAddLike = await News.findByIdAndUpdate(
        news,
        { $inc: { likes: 1 } },
        { new: true }
      );

      if (!updatedNewsAddLike) {
        throw new Error('News not found');
      }

      likesCount = updatedNewsAddLike.likes;
      message = 'You removed your dislike and liked this news';
    } else if (existingLike) {
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
      message = 'You unliked this news';
    } else {
      await Likes.create({
        news: news,
        user: userId,
      });

      const updatedNewsAddLike = await News.findByIdAndUpdate(
        news,
        { $inc: { likes: 1 } },
        { new: true }
      );

      if (!updatedNewsAddLike) {
        throw new Error('News not found');
      }

      likesCount = updatedNewsAddLike.likes;
      message = 'You liked this news';
    }

    const updatedNewsCounts = await News.findById(news);

    if (!updatedNewsCounts) {
      throw new Error('News not found');
    }

    dislikesCount = updatedNewsCounts.dislikes || 0;

    console.log('Likes count after like operation:', likesCount);
    console.log('Dislikes count after like operation:', dislikesCount);

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

// exports.getLikedNewsByUser = catchAsync(async (req, res, next) => {
//   const { userId } = req.user;

//   try {
//     // Retrieve the liked news by the user
//     const likedNews = await Like.find({ user: userId }).populate('news');

//     // Modify each likedNews object to include the isLiked field
//     const likedNewsWithIsLiked = likedNews.map((like) => {
//       return {
//         ...like.toObject(), // Convert to plain JavaScript object
//         isLiked: like.isLiked, // Assuming you have a field named isLiked in your LikeSchema
//       };
//     });

//     res.status(200).json({
//       status: 'success',
//       likedNews: likedNewsWithIsLiked,
//     });
//   } catch (error) {
//     return next(error); // Pass the error to the global error handler
//   }
// });

exports.getLikedNewsByUser = catchAsync(async (req, res, next) => {
  const { newsId } = req.params;

  try {
    const newsExists = await News.exists({ _id: newsId });

    if (!newsExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'News not found.',
      });
    }

    const likedUsers = await Likes.find({ news: newsId }).populate({
      path: 'user',
      select: 'name email',
    });

    const likedUsersCount = likedUsers.length;

    res.status(200).json({
      status: 'success',
      likedUsersCount,
      likedUsers,
    });
  } catch (error) {
    return next(error);
  }
});
