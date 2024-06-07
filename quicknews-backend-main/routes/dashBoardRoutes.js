const express = require('express');
const dashboardController = require('../controllers/dashBoardController');

const router = express.Router();

router.route('/stats').get(dashboardController.getDashboardStats);

module.exports = router;
