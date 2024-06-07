const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const notificationController = require('../controllers/notificationController');

router.get('/notifications', notificationController.getAllNotifications);
router.get('/all', notificationController.getNotifications);


router.get(
  '/user',
  authController.protect,
  notificationController.getUserNotificationsById
);

module.exports = router;
