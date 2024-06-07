const express = require('express');
const newsController = require('../controllers/newsController');
const authController = require('../controllers/authController');
const authenticationToken = require('../utils/middleware');

const router = express.Router();


router.route('/').get(newsController.getAllNews).post(
  newsController.uploadNewsMedia,
  authController.protect,
  // (req, res, next) => {
  //   req.body.publishedBy = req.user._id;
  //   next();
  // },
  newsController.createNewsWithNotification
);
router.route('/reporter').get(  authController.protect,
  newsController.getReporterNews)
router.route('/trending').get(newsController.getTrendingNews);

router
  .route('/:id')
  .get(newsController.getNews)
  .patch(newsController.updateNews)
  .delete(
    // authController.protect,
    // authController.restrictTo('admin'),
    newsController.deleteNews
  );

router.get('/by-place/:placeId', newsController.getAllNewsByPlace);

router.get('/language/:languageId', newsController.getAllNewsByLanguage);

router.get('/category/:categoryId', newsController.getAllNewsByCategory);
router.put('/like/:id', newsController.hitLike);
router.put('/un-like/:id', newsController.hitUnLike);

module.exports = router;
