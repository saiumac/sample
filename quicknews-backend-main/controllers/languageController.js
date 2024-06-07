const Language = require('../models/languageModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllLanguages = catchAsync(async (req, res) => {
  const languages = await Language.find();

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    TotalLanguages: languages.length,
    languages,
  });
});

exports.createLanguage = catchAsync(async (req, res) => {
  // const existingLanguage = await Language.findOne({ name: req.body.name });

  // if (existingLanguage) {
  //   // Language already exists, send an error response
  //   return res.status(400).json({
  //     status: 'fail',
  //     message: 'Language already exists',
  //   });
  // }

  const newLanguage = await Language.create(req.body);

  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    languages: newLanguage,
  });
});

exports.getLanguage = factory.getOne(Language);
exports.updateLanguage = factory.updateOne(Language);
exports.deleteLanguage = factory.deleteOne(Language);
