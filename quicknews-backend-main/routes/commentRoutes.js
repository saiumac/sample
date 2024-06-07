const express = require('express');
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/:newsId',
  authController.protect,
  commentController.createComment
);

router.get('/:newsId', commentController.getCommentsForNews);

router.patch(
  '/:commentId',
  authController.protect,
  commentController.updateComment
);

router.delete('/:commentId', commentController.deleteComment);

module.exports = router;
