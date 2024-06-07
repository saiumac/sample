const Location = require('../models/locationModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.saveUserLocation = catchAsync(async (req, res, next) => {
  const { user, latitude, longitude } = req.body;

  const existingLocation = await Location.findOne({ user });

  if (existingLocation) {
    existingLocation.latitude = latitude;
    existingLocation.longitude = longitude;
    existingLocation.updatedAt = new Date();
    await existingLocation.save();
  } else {
    const location = await Location.create({
      user,
      latitude,
      longitude,
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      user,
      longitude,
      latitude,
    },
  });
});
