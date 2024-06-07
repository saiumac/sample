const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.get('/', authController.getAllUsers);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/login/email', authController.gmailLogin);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.route('/').get(userController.getAllUsers);

// router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);
router.get('/getme', userController.getMe);

router
  .route('/:id')
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
