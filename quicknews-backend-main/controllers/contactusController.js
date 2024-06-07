const Contactus = require('../models/contactusModel');

exports.createContactus = async (req, res) => {
  try {
    const { mobileNumber, message } = req.body;
    const newContactus = new Contactus({ mobileNumber, message });
    await newContactus.save();
    res.status(201).json({ message: 'Contactus created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
