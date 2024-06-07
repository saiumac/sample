const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', feedbackController.getAllFeedbacks);
router
  .route('/:Id')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    feedbackController.createFeedback
  )
  .patch(authController.protect, feedbackController.updateFeedback)
  .delete(authController.protect, feedbackController.deleteFeedback);

module.exports = router;
