const Place = require('../models/placeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllPlaces = catchAsync(async (req, res) => {
  const places = await Place.find();

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    TotalPlaces: places.length,
    places,
  });
});

exports.createPlace = catchAsync(async (req, res, next) => {
  // const existingPlace = await Place.findOne({ name: req.body.name });

  // if (existingPlace) {
  //   return next(new AppError('Place already exists', 400));
  // }

  const newPlace = await Place.create(req.body);

  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    places: newPlace,
  });
});

exports.getPlace = factory.getOne(Place);
exports.updatePlace = factory.updateOne(Place);
exports.deletePlace = factory.deleteOne(Place);
