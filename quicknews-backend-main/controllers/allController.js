const Ad = require('../models/adModel');
const Quote = require('../models/quoteModel');
const Short = require('../models/shortModel');
const View = require('../models/viewModel');
const DeviceId = require('../models/deviceIdModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeautures');

const factory = require('./handlerFactory');
const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.body.title}-${Date.now()}.${ext}`);
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

exports.uploadMedia = upload.single('chooseFile');

exports.getAllAds = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Ad.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const ads = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    TotalAds: ads.length,
    ads,
  });
});

exports.getAds = catchAsync(async (req, res, next) => {
  const adId = req.params.id;
  const deviceId = req.body.deviceId;
  const ads = await Ad.findById(adId);
  console.log('adId', adId);

  if (!ads) {
    return next(new AppError('No add found with that ID', 404));
  }
  if (deviceId) {
    const existingDevice = await DeviceId.findOne({ deviceId });
    const existingView = await View.findOne({ adId, deviceId });

    if (!existingDevice) {
      ads.views += 1;
      await View.create({ adId, deviceId });
      await Ad.findByIdAndUpdate(
        adId,
        { $inc: { views: 1 } },
        { new: true, runValidators: true }
      );
    } else if (!existingView) {
      ads.views += 1;
      await View.create({ adId, deviceId });
      await Ad.findByIdAndUpdate(
        adId,
        { $inc: { views: 1 } },
        { new: true, runValidators: true }
      );
    }
  }

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    ads,
  });
});

exports.createAds = catchAsync(async (req, res, next) => {
  const { title, chooseFile, publishedBy, summary, source } = req.body;

  let mediaType = null;

  if (req.file) {
    if (req.file.mimetype.startsWith('image')) {
      mediaType = 'Image';
    } else if (req.file.mimetype.startsWith('video')) {
      mediaType = 'Video';
    }
  }

  const adsData = {
    title,
    chooseFile,
    publishedBy,
    mediaType,
    summary,
    source,
  };

  if (req.file) {
    adsData.chooseFile = `public/uploads/${req.file.filename}`;
  }

  const newAds = await Ad.create(adsData);

  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    ads: newAds,
  });
});
exports.updateAds = [
  exports.uploadMedia,
  catchAsync(async (req, res, next) => {
    const { title, chooseFile, publishedBy, summary, source } = req.body;

    let mediaType = null;

    if (req.file) {
      if (req.file.mimetype.startsWith('image')) {
        mediaType = 'Image';
      } else if (req.file.mimetype.startsWith('video')) {
        mediaType = 'Video';
      }
    }

    const existingAd = await Ad.findById(req.params.id);

    if (!existingAd) {
      return next(new AppError('No ad found with that ID', 404));
    }

    const updatedMediaType = req.file ? mediaType : existingAd.mediaType;

    const adData = {
      title,
      chooseFile,
      publishedBy,
      mediaType: updatedMediaType,
      summary,
      source,
    };

    if (req.file) {
      adData.chooseFile = `public/uploads/${req.file.filename}`;
    }

    const ad = await Ad.findByIdAndUpdate(req.params.id, adData, {
      new: true,
    });

    if (!ad) {
      return next(new AppError('No ad found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      ad,
    });
  }),
];

exports.getAllShorts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Short.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const shorts = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    TotalShorts: shorts.length,
    shorts,
  });
});

exports.getShorts = catchAsync(async (req, res, next) => {
  const shortId = req.params.id;
  const deviceId = req.body.deviceId;
  const shorts = await Short.findById(shortId);
  console.log('shortId', shortId);

  if (!shorts) {
    return next(new AppError('No shorts found with that ID', 404));
  }
  if (deviceId) {
    const existingDevice = await DeviceId.findOne({ deviceId });
    const existingView = await View.findOne({ shortId, deviceId });

    if (!existingDevice) {
      shorts.views += 1;
      await View.create({ shortId, deviceId });
      await Short.findByIdAndUpdate(
        shortId,
        { $inc: { views: 1 } },
        { new: true, runValidators: true }
      );
    } else if (!existingView) {
      shorts.views += 1;
      await View.create({ shortId, deviceId });
      await Short.findByIdAndUpdate(
        shortId,
        { $inc: { views: 1 } },
        { new: true, runValidators: true }
      );
    }
  }

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    shorts,
  });
});

exports.createShorts = catchAsync(async (req, res, next) => {
  const { title, chooseFile, publishedBy, summary, source } = req.body;

  let mediaType = null;

  if (req.file) {
    if (req.file.mimetype.startsWith('image')) {
      mediaType = 'Image';
    } else if (req.file.mimetype.startsWith('video')) {
      mediaType = 'Video';
    }
  }

  const shortsData = {
    title,
    chooseFile,
    publishedBy,
    mediaType,
    summary,
    source,
  };

  if (req.file) {
    shortsData.chooseFile = `public/uploads/${req.file.filename}`;
  }

  const shorts = await Short.create(shortsData);

  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    shorts: shorts,
  });
});

exports.updateShorts = [
  exports.uploadMedia,
  catchAsync(async (req, res, next) => {
    const { title, chooseFile, publishedBy, summary, source } = req.body;

    let mediaType = null;

    if (req.file) {
      if (req.file.mimetype.startsWith('image')) {
        mediaType = 'Image';
      } else if (req.file.mimetype.startsWith('video')) {
        mediaType = 'Video';
      }
    }

    const existingShort = await Short.findById(req.params.id);

    if (!existingShort) {
      return next(new AppError('No short found with that ID', 404));
    }

    const updatedMediaType = req.file ? mediaType : existingShort.mediaType;

    const shortData = {
      title,
      chooseFile,
      publishedBy,
      mediaType: updatedMediaType,
      summary,
      source,
    };

    if (req.file) {
      shortData.chooseFile = `public/uploads/${req.file.filename}`;
    }

    const short = await Short.findByIdAndUpdate(req.params.id, shortData, {
      new: true,
    });

    if (!short) {
      return next(new AppError('No short found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      short,
    });
  }),
];

exports.getAllQuotes = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Quote.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const quotes = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    TotalQuotes: quotes.length,
    quotes,
  });
});

exports.getQuotes = catchAsync(async (req, res, next) => {
  const quoteId = req.params.id;
  const deviceId = req.body.deviceId;
  const quotes = await Quote.findById(quoteId);
  console.log('quoteId', quoteId);

  if (!quotes) {
    return next(new AppError('No quote found with that ID', 404));
  }

  if (deviceId) {
    const existingDevice = await DeviceId.findOne({ deviceId });
    const existingView = await View.findOne({ quoteId, deviceId });

    if (!existingDevice) {
      quotes.views += 1;
      await View.create({ quoteId, deviceId });
      await Quote.findByIdAndUpdate(
        quoteId,
        { $inc: { views: 1 } },
        { new: true, runValidators: true }
      );
    } else if (!existingView) {
      quotes.views += 1;
      await View.create({ quoteId, deviceId });
      await Quote.findByIdAndUpdate(
        quoteId,
        { $inc: { views: 1 } },
        { new: true, runValidators: true }
      );
    }
  }
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    quotes,
  });
});

exports.createQuotes = catchAsync(async (req, res, next) => {
  const { title, chooseFile, publishedBy, summary, source } = req.body;

  let mediaType = null;

  if (req.file) {
    if (req.file.mimetype.startsWith('image')) {
      mediaType = 'Image';
    } else if (req.file.mimetype.startsWith('video')) {
      mediaType = 'Video';
    }
  }

  const quotesData = {
    title,
    chooseFile,
    publishedBy,
    mediaType,
    summary,
    source,
  };

  if (req.file) {
    quotesData.chooseFile = `public/uploads/${req.file.filename}`;
  }

  const quotes = await Quote.create(quotesData);

  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    quotes: quotes,
  });
});

exports.updateQuotes = [
  exports.uploadMedia,
  catchAsync(async (req, res, next) => {
    const { title, chooseFile, publishedBy, summary, source } = req.body;

    let mediaType = null;

    if (req.file) {
      if (req.file.mimetype.startsWith('image')) {
        mediaType = 'Image';
      } else if (req.file.mimetype.startsWith('video')) {
        mediaType = 'Video';
      }
    }

    const existingQuote = await Quote.findById(req.params.id);

    if (!existingQuote) {
      return next(new AppError('No quote found with that ID', 404));
    }

    const updatedMediaType = req.file ? mediaType : existingQuote.mediaType;

    const quoteData = {
      title,
      chooseFile,
      publishedBy,
      mediaType: updatedMediaType,
      summary,
      source,
    };

    if (req.file) {
      quoteData.chooseFile = `public/uploads/${req.file.filename}`;
    }

    const quote = await Quote.findByIdAndUpdate(req.params.id, quoteData, {
      new: true,
    });

    if (!quote) {
      return next(new AppError('No quote found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      quote,
    });
  }),
];

exports.deleteQuotes = catchAsync(async (req, res, next) => {
  const quotes = await Quote.findByIdAndDelete(req.params.id);

  if (!quotes) {
    return next(new AppError('No quotes found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateShareCount = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    quote.share_count++;
    await quote.save();
    res.status(200).json({
      status: 'success',
      message: 'Share count incremented successfully',
      quote,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteAds = factory.deleteOne(Ad);
exports.deleteShorts = factory.deleteOne(Short);
