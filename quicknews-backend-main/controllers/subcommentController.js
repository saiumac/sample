const Subcomment = require('../models/subcommentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Comment = require('../models/commentModel');

exports.createSubcomment = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  const { commentId } = req.params;
  const userId = req.user.id;

  console.log('Creating subcomment for commentId:', commentId);

  const isValidCommentId = await Comment.exists({ _id: commentId });
  if (!isValidCommentId) {
    console.log('Invalid comment ID');
    return next(new AppError('Invalid comment ID', 400));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    console.log('Comment not found');
    return next(new AppError('Comment not found', 404));
  }

  const newSubcomment = await Subcomment.create({
    content,
    user: userId,
    comment: commentId,
  });

  console.log('Subcomment created:', newSubcomment);

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { $inc: { subcommentCount: 1 } },
    { new: true }
  );

  if (!updatedComment) {
    console.log('Failed to update subcomment count');
    return next(new AppError('Failed to update subcomment count', 500));
  }

  console.log('Subcomment count updated:', updatedComment.subcommentCount);

  res.status(201).json({
    status: 'success',
    subcomment: newSubcomment,
  });
});

exports.getSubcommentsForComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const subcomments = await Subcomment.find({ comment: commentId });

  res.status(200).json({
    status: 'success',
    subcomments,
  });
});

exports.deleteSubcomment = catchAsync(async (req, res, next) => {
  const subcommentId = req.params.subcommentId;

  const subcomment = await Subcomment.findById(subcommentId);
  if (!subcomment) {
    return next(new AppError('Subcomment not found', 404));
  }

  await Subcomment.findByIdAndDelete(subcommentId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
