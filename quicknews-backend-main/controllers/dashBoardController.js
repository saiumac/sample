const News = require('../models/newsModel');
const Ad = require('../models/adModel');
const Quote = require('../models/quoteModel');
const Short = require('../models/shortModel');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const newsStats = await getStats(News, 'news');
  const adStats = await getStats(Ad, 'ads');
  const quoteStats = await getStats(Quote, 'quotes');
  const shortsStats = await getStats(Short, 'shorts');

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    newsStats,
    adStats,
    quoteStats,
    shortsStats,
  });
});

async function getStats(Model, category) {
  const totalLikes = await Model.aggregate([
    {
      $group: {
        _id: null,
        totalLikes: { $sum: '$likes' },
      },
    },
  ]);

  const totalDislikes = await Model.aggregate([
    {
      $group: {
        _id: null,
        totalDislikes: { $sum: '$dislikes' },
      },
    },
  ]);

  const mostViewedItems = await Model.aggregate([
    {
      $group: {
        _id: '$_id',
        totalViews: { $sum: '$views' },
      },
    },
    {
      $match: {
        totalViews: { $gt: 0 },
      },
    },
    {
      $sort: { totalViews: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  const populatedMostViewedItems = await Model.populate(mostViewedItems, {
    path: '_id',
  });

  const totalViews = mostViewedItems.reduce(
    (acc, item) => acc + item.totalViews,
    0
  );

  const totalCount = await Model.countDocuments();

  return {
    category,
    totalCount,
    totalLikes: totalLikes.length ? totalLikes[0].totalLikes : 0,
    totalDislikes: totalDislikes.length ? totalDislikes[0].totalDislikes : 0,
    totalViews: totalViews || 0,
    mostViewedItems: populatedMostViewedItems,
  };
}
