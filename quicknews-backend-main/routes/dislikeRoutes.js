const express = require('express');
const dislikesController = require('../controllers/dislikesController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/:newsId')
  .post(authController.protect, dislikesController.createDislike);

router
  .route('/:newsId/disliked-users')
  .get(dislikesController.getDislikedNewsByUser);

module.exports = router;
