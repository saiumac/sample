const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: categories.length,
    categories,
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  // const existingCategory = await Category.findOne({ name: req.body.name });

  // if (existingCategory) {
  //   // Category already exists, send an error response
  //   return res.status(400).json({
  //     status: 'fail',
  //     message: 'Category already exists',
  //   });
  // }
  const newCategory = await Category.create(req.body);

  res.status(201).json({
    status: 'success',
    requestedAt: req.requestTime,
    category: newCategory,
  });
});

exports.updateCategory = factory.updateOne(Category);
exports.deleteCategory = factory.deleteOne(Category);
exports.getCategory = factory.getOne(Category);
