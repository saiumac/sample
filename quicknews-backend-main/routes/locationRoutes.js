const express = require('express');
const locationController = require('../controllers/locationController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').post(locationController.saveUserLocation);

module.exports = router;
