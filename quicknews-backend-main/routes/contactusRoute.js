const express = require('express');
const ContactusController = require('../controllers/contactusController');

const router = express.Router();

router.route('/').post(ContactusController.createContactus);

module.exports = router;
