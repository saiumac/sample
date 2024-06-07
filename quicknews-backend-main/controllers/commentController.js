const Comment = require('../models/commentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const News = require('../models/newsModel');

exports.createComment = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  const news = await News.findById(req.params.newsId);
  if (!news) {
    return next(new AppError('News post not found', 404));
  }

  const newComment = await Comment.create({
    content,
    user: req.user.id,
    news: news,
  });

  await updateCommentCount(news._id, 1);

  res.status(201).json({
    status: 'success',
    comment: newComment,
  });
});

async function updateCommentCount(newsId, value) {
  try {
    await News.findOneAndUpdate(
      { _id: newsId },
      { $inc: { comments: value } },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating comment count:', error);
  }
}
exports.getCommentsForNews = catchAsync(async (req, res, next) => {
  const newsId = req.params.newsId;

  const userId = req.user ? req.user.id : null;

  const commentsQuery = userId
    ? { news: newsId, user: userId }
    : { news: newsId };

  const comments = await Comment.find(commentsQuery).populate({
    path: 'user',
    select: 'name',
  });

  res.status(200).json({
    status: 'success',
    comments,
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.commentId;

  const userId = req.user ? req.user.id : null;

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { content: req.body.content },
    { new: true }
  );

  if (!comment) {
    return res.status(404).json({
      status: 'fail',
      message: 'Comment not found or unauthorized to update.',
    });
  }

  res.status(200).json({
    status: 'success',
    comment,
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.commentId;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  comment.count = Math.max(0, comment.count - 1);
  await comment.save();

  const newsId = comment.news;
  const news = await News.findById(newsId);

  if (news) {
    news.comments = Math.max(0, news.comments - 1);
    await news.save();
  }

  await Comment.findByIdAndDelete(commentId);

  const updatedCount = await Comment.countDocuments();

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
