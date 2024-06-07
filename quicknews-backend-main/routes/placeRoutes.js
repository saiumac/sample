const express = require('express');
const placeController = require('../controllers/placeController');

const router = express.Router();

router
  .route('/')
  .post(placeController.createPlace)
  .get(placeController.getAllPlaces);

router
  .route('/:id')
  .get(placeController.getPlace)
  .patch(placeController.updatePlace)
  .delete(placeController.deletePlace);

module.exports = router;
