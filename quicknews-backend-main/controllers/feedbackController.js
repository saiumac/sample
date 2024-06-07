const Feedback = require('../models/feedbackModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllFeedbacks = catchAsync(async (req, res, next) => {
  const feedbacks = await Feedback.find().populate({
    path: 'user',
    select: 'name email',
  });

  res.status(200).json({
    status: 'success',
    results: feedbacks.length,
    feedbacks,
  });
});

exports.createFeedback = catchAsync(async (req, res, next) => {
  const { feedback, rating } = req.body;

  if (!feedback || !rating) {
    return res.status(400).json({
      status: 'error',
      message: 'Feedback and rating are required for feedback submission.',
    });
  }

  const userId = req.user.id;

  const existingFeedback = await Feedback.findOne({ user: userId });

  if (existingFeedback) {
    return res.status(400).json({
      status: 'error',
      message: 'You have already submitted feedback.',
    });
  }

  const newFeedback = await Feedback.create({
    user: userId,
    feedback,
    rating,
  });

  res.status(201).json({
    status: 'success',
    feedback: newFeedback,
  });
});

exports.updateFeedback = catchAsync(async (req, res, next) => {
  const { feedback, rating } = req.body;

  if (!feedback || !rating) {
    return res.status(400).json({
      status: 'error',
      message: 'Feedback and rating are required for feedback update.',
    });
  }

  const userId = req.user.id;

  const existingFeedback = await Feedback.findOne({ user: userId });

  if (!existingFeedback) {
    return res.status(404).json({
      status: 'error',
      message:
        'Feedback not found. Please submit feedback before attempting to update.',
    });
  }

  existingFeedback.feedback = feedback;
  existingFeedback.rating = rating;

  const updatedFeedback = await existingFeedback.save();

  res.status(200).json({
    status: 'success',
    feedback: updatedFeedback,
  });
});

exports.deleteFeedback = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const existingFeedback = await Feedback.findOne({ user: userId });

  if (!existingFeedback) {
    return res.status(404).json({
      status: 'error',
      message: 'Feedback not found.',
    });
  }

  await existingFeedback.deleteOne();

  res.status(204).json({
    status: 'success',
    message: 'Feedback deleted successfully.',
  });
});
