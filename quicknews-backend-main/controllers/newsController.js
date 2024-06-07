const News = require('../models/newsModel');
const Place = require('../models/placeModel');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const View = require('../models/viewModel');
const DeviceId = require('../models/deviceIdModel');
const Location = require('../models/locationModel');
const Likes = require('../models/likesModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeautures');
const Language = require('../models/languageModel');
const multer = require('multer');
const admin = require('firebase-admin');
const moment = require('moment-timezone');
const { isValidObjectId } = require('mongoose');
const timezone = require('timezone');
// // const serviceAccount = require('./serviceAccountKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const saveNotification = async (title, body, userId) => {
  try {
    await Notification.create({
      title,
      body,
      userId,
    });
  } catch (error) {
    console.error('Error saving notification:', error);
  }
};

const sendPushNotifications = async () => {
  const serverKey = '';

  try {
    const userFCMTokens = await User.find({
      userType: 'user',
      isActive: true,
    });

    for (const token of userFCMTokens) {
      const notification = {
        title: 'New News Created',
        body: 'A new news article has been created. Check it out!',
      };

      const dataPayload = {
        key1: 'category',
      };

      const fcmPayload = {
        to: token.fcmToken,
        notification: notification,
        data: dataPayload,
      };

      const response = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        fcmPayload,
        {
          headers: {
            Authorization: 'key=' + serverKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Notification sent successfully:', response.data);
    }
  } catch (error) {
    console.error(
      'Error sending notification:',
      error.response ? error.response.data : error.message
    );
  }
};

sendPushNotifications();

const sendNotification = async (token, title, body) => {
  const message = {
    token,
    notification: {
      title,
      body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(' notification sent:', response);
  } catch (error) {
    console.error('Error sending  notification:', error);
  }
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.split(' ').join('-');
    const ext = file.mimetype.split('/')[1];
    cb(null, `${Date.now()}-${fileName}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Not an image or video! Please upload only images or videos',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadNewsMedia = upload.single('chooseFile');

exports.getAllNews = catchAsync(async (req, res, next) => {
  try{
    const match = {};

    if (req.query.isVerified) {
      match.isVerified = req.query.isVerified;
    }
    const features = new APIFeatures(News.find(match), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .sort({ publishedBy: -1 });
  
    const news = await features.query
      .populate({
        path: 'language',
        select: 'language',
      })
      .populate({
        path: 'place',
        select: 'place',
      })
      .populate({
        path: 'category',
        select: 'category',
      })
      .populate({
        path: "publishedBy",
        select: 'name',
      })

  
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      Totalnews: news.length,
      news,
    });
  }catch(error){
    res.status(500).json({
      status: 'terive news failed',error
    });
  }
  
});

exports.getReporterNews = catchAsync(async (req, res, next) => {
  const match = {};

  if (req.query.isVerified) {
    match.isVerified = req.query.isVerified;
  }
  match.publishedBy = req.user._id
  const features = new APIFeatures(News.find(match), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .sort({ publishedDate: -1 });

  const news = await features.query
    .populate({
      path: 'language',
      select: 'language',
    })
    .populate({
      path: 'place',
      select: 'place',
    })
    .populate({
      path: 'category',
      select: 'category',
    });

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    Totalnews: news.length,
    news,
  });
});

exports.getTrendingNews = catchAsync(async (req, res, next) => {
  const trendingNews = await News.find({ views: { $gt: 200 }, isVerified:"Approved" }).sort({
    views: -1,
  });

  for (const news of trendingNews) {
    if (!news.isTrending) {
      await News.findByIdAndUpdate(news._id, { isTrending: true });
    }
  }

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    TotalTrendingNews: trendingNews.length,
    trendingNews,
  });
});

exports.getNews = catchAsync(async (req, res, next) => {
  const newsId = req.params.id;
  const deviceId = req.body.deviceId;

  console.log('newsId', newsId);

  const news = await News.findById(newsId)
    .populate({
      path: 'language',
      select: 'language',
    })
    .populate({
      path: 'place',
      select: 'place',
    })
    .populate({
      path: 'category',
      select: 'category',
    });

  if (!news) {
    return next(new AppError('No news found with that ID', 404));
  }

  if (deviceId) {
    const existingDevice = await DeviceId.findOne({ deviceId });
    const existingView = await View.findOne({ newsId, deviceId });

    if (!existingDevice) {
      news.views += 1;
      await View.create({ newsId, deviceId });
      await News.findByIdAndUpdate(
        newsId,
        { $inc: { views: 1 } },
        { new: true, runValidators: true }
      );
    } else if (!existingView) {
      news.views += 1;
      await View.create({ newsId, deviceId });
      await News.findByIdAndUpdate(
        newsId,
        { $inc: { views: 1 } },
        { new: true, runValidators: true }
      );
    }
  }

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    news,
  });
});

exports.createNewsWithNotification = catchAsync(async (req, res, next) => {
  let {
    title,
    chooseFile,
    category,
    place,
    language,
    summary,
    source,
    mediaType,
    isNews,
    isQuotate,
    isAdd,
    isVerified,
  } = req.body;

  console.log("USER", req.user._id);

  if (req.file) {
    if (req.file.mimetype.startsWith('image')) {
      mediaType = 'Image';
    } else if (req.file.mimetype.startsWith('video')) {
      mediaType = 'Video';
    }
  }

  const utcDate = new Date();
  const istDate = moment(utcDate).tz('Asia/Kolkata');

  const originalUTCDateFormatted = moment.tz(utcDate, "Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");
  const convertedISTDateFormatted = istDate.format("YYYY-MM-DD hh:mm:ss A");

  console.log("Original UTC Date:", originalUTCDateFormatted);
  console.log("Converted IST Date:", convertedISTDateFormatted);

  const newsData = {
    title,
    category,
    chooseFile,
    place,
    language,
    mediaType,
    summary,
    source,
    isNews,
    isAdd,
    isQuotate,
    isVerified,
    publishedDate: convertedISTDateFormatted,
  };

  if (req.file) {
    newsData.chooseFile = `public/uploads/${req.file.filename}`;
  }

  const newNews = await News.create(newsData);
  if(isVerified=='Approved'){
    const userFCMTokens = await User.find({
      role: 'user',
      active: true,
    });
    // console.log('$$$$$$$$$$$$$$$$$', userFCMTokens);
    userFCMTokens.forEach(async (user) => {
      await Notification.create({
        message: title,
        user: user._id,
        news: newNews._id,
      });
    });
  }

  // Send push notification to users
  // const allUserTokens = userFCMTokens.map((user) => user.fcmToken);
  // const notificationTitle = 'New News Created';
  // const notificationBody = 'A new news article has been created. Check it out!';

  // Send push notification using admin.messaging()
  // allUserTokens.forEach((token) => {
  //   sendNotification(token, notificationTitle, notificationBody);
  // });

  // Send FCM notification
  // sendPushNotifications(userFCMTokens);

  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    news: newNews,
  });
});

exports.updateNews = [
  exports.uploadNewsMedia,
  catchAsync(async (req, res, next) => {
    const {
      title,
      category,
      publishedBy,
      place,
      language,
      summary,
      source,
      isNews,
      isAdd,
      isQuotate,
      isTrending,
      isVerified,
    } = req.body;

    let mediaType = null;
    if (req.file) {
      if (req.file.mimetype.startsWith('image')) {
        mediaType = 'Image';
      } else if (req.file.mimetype.startsWith('video')) {
        mediaType = 'Video';
      }
    }

    const istDate = moment.tz(Date.now(), 'Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');


    const existingNews = await News.findById(req.params.id);

    if (!existingNews) {
      return next(new AppError('No news found with that ID', 404));
    }

    const updatedMediaType = req.file ? mediaType : existingNews.mediaType;

    const newsData = {
      title,
      category,
      publishedBy,
      place,
      language,
      mediaType: updatedMediaType,
      summary,
      source,
      isNews,
      isAdd,
      isQuotate,
      isTrending,
      isVerified,
      publishedDate: istDate,
    };

    if (req.file) {
      newsData.chooseFile = `public/uploads/${req.file.filename}`;
    }

    const updatedNews = await News.findByIdAndUpdate(req.params.id, newsData, {
      new: true,
      runValidators: true,
    });

    if (!updatedNews) {
      return next(new AppError('Error updating news', 500));
    }

    res.status(200).json({
      status: 'success',
      news: updatedNews,
    });
  }),
];


exports.deleteNews = catchAsync(async (req, res, next) => {
  const news = await News.findByIdAndDelete(req.params.id);

  if (!news) {
    return next(new AppError('No news found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllNewsByPlace = catchAsync(async (req, res, next) => {
  const placeId = req.params.placeId;

  console.log(`Attempting to find place with ID`);

  try {
    const place = await Place.findById(placeId);

    if (!place) {
      console.error(`No place found with ID: ${placeId}`);
      return next(new AppError('No place found with that ID', 404));
    }

    console.log(`Found place: ${place.place} (ID: ${placeId})`);

    newsInPlace = await News.find({ place: placeId, isVerified:"Approved" });

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      news: newsInPlace,
    });
  } catch (error) {
    console.error('Error while finding place by ID:', error);
    return next(new AppError('Error while querying the database', 500));
  }
});

exports.getAllNewsByLanguage = async (req, res, next) => {
  const languageId = req.params.languageId;

  try {
    const newsByLanguage = await News.find({ language: languageId, isVerified:"Approved" })
      .populate({
        path: 'language',
        select: 'language',
      })
      .populate({
        path: 'category',
        select: 'category',
      })
      .populate({
        path: 'place',
        select: 'place',
      });

    res.status(200).json({
      status: 'success',
      requestedAt: new Date(),
      news: newsByLanguage,
    });
  } catch (error) {
    console.error('Error while querying news by language:', error);
    return next(new AppError('Error while querying the database', 500));
  }
};

exports.getAllNewsByCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;

  try {
    const newsByCategory = await News.find({ category: categoryId, isVerified:"Approved" }).populate({
      path: 'category',
      select: 'category',
    });

    res.status(200).json({
      status: 'success',
      requestedAt: new Date(),
      news: newsByCategory,
    });
  } catch (error) {
    console.error('Error while querying news by category ID:', error);
    return next(new AppError('Error while querying the database', 500));
  }
};



exports.hitLike = catchAsync(async (req, res, next) => {
  const NewsId = req.params.id;
  const news = await News.findById(NewsId);

  if (!news) {
    return next(new AppError('No news found with that ID', 404));
  }

  news.likes++;
  await news.save();

  res.status(200).json({
    status: 'success',
    message: 'Likes count incremented successfully',
    news,
  });
});



exports.hitUnLike = catchAsync(async (req, res, next) => {
  const newsId = req.params.id;
  const news = await News.findById(newsId);

  if (!news) {
    return next(new AppError('No news found with that ID', 404));
  }

  if (news.likes > 0) {
    news.likes--;
  } else {
    return next(new AppError('Dislikes count cannot be less than zero', 400));
  }

  await news.save();

  res.status(200).json({
    status: 'success',
    message: 'Dislikes count decremented successfully',
    news,
  });
});
