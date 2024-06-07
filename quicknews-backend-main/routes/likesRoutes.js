const express = require('express');
const likesController = require('../controllers/likesController');
const authController = require('../controllers/authController');
const router = express.Router();

router
  .route('/:newsId')
  .post(authController.protect, likesController.createLike);

router.route('/:newsId/liked-users').get(likesController.getLikedNewsByUser);

module.exports = router;
