const express = require('express');
const allController = require('../controllers/allController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/ads')
  .get(allController.getAllAds)
  .post(allController.uploadMedia, allController.createAds);

router
  .route('/ads/:id')
  .get(allController.getAds)
  .patch(allController.updateAds)
  .delete(allController.deleteAds);

router
  .route('/shorts')
  .get(allController.getAllShorts)
  .post(allController.uploadMedia, allController.createShorts);

router
  .route('/shorts/:id')
  .get(allController.getShorts)
  .patch(allController.updateShorts)
  .delete(allController.deleteShorts);

router
  .route('/quotes')
  .get(allController.getAllQuotes)
  .post(allController.uploadMedia, allController.createQuotes);

router
  .route('/quotes/:id')
  .get(allController.getQuotes)
  .patch(allController.updateQuotes)
  .delete(allController.deleteQuotes);

router.route('/quotes/:id/share_count').patch(allController.updateShareCount);

module.exports = router;
