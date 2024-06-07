const Sights = require('../models/sightsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeautures');
const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `news-${req.body.title}-${Date.now()}.${ext}`);
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

const upload = multer({ storage: multerStorage });

exports.uploadMedia = upload.array('files', 10);

exports.createSightFiles = catchAsync(async (req, res) => {
  try {
    const filesData = req.files.map((file) => ({
      filename: file.originalname,
      filePath: file.path,
    }));

    const sightFiles = new Sights({
      title: req.body.title,
      files: filesData,
    });

    await sightFiles.save();
    res
      .status(201)
      .json({ message: 'Files uploaded successfully', sightFiles });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

exports.getAllSights = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Sights.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const sights = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    Totalsights: sights.length,
    sights,
  });
});
