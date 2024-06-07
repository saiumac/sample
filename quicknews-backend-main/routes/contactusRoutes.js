const express = require('express');
const ContactusController = require('../controllers/contactusController');

const router = express.Router();

router.post('/', ContactusController.createContactus);

module.exports = router;
