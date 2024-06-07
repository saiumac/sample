const express = require('express');
const sightsController = require('../controllers/sightsController');

const router = express.Router();


router
  .route('/')
  .get(
    sightsController.getAllSights
  )
  .post(
    sightsController.uploadMedia, sightsController.createSightFiles
  )
  

module.exports = router;
