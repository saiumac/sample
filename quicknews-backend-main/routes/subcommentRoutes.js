const express = require('express');
const router = express.Router();
const subcommentController = require('../controllers/subcommentController');
const authController = require('../controllers/authController');

// Routes for Subcomments
router.post(
  '/:commentId',
  authController.protect,
  subcommentController.createSubcomment
);
router.get('/:commentId', subcommentController.getSubcommentsForComment);
router.delete('/:subcommentId', subcommentController.deleteSubcomment);

module.exports = router;
