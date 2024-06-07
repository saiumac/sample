const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Notification = require('../models/notificationModel');
const News = require('../models/newsModel');

exports.getAllNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find().populate('user news');
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    TotalNotifications: notifications.length,
    notifications: notifications,
  });
});

exports.getUserNotificationsById = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  console.log('#####', userId);
  const userNotifications = await Notification.find({ user: userId }).populate(
    'news'
  );

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    userNotifications: userNotifications,
  });
});

exports.getNotifications = catchAsync(async (req, res, next) => {
  try {
    const notifications = await Notification.distinct('news').populate('news');
    const newsDetailsPromises = notifications.map((newsId) => {
      return News.findById(newsId).exec();
    });

    const newsDetails = await Promise.all(newsDetailsPromises);
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      count: notifications.length,
      notifications: newsDetails,
    });
  } catch (error) {
    console.error(
      'Error retrieving notifications with distinct news IDs:',
      error
    );
    throw error;
  }
});
