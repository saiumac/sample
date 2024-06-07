const crypto = require('crypto');
const { promisify } = require('util'); // this is just using es6 destructuring
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const DeviceId = require('../models/deviceIdModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const bcrypt = require('bcrypt');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (User, statusCode, res, referrerUserInfo = null) => {
  const token = signToken(User._id);
  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN         //we can also use this
  // });
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  User.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      User: {
        email: User.email,
        photo: User.photo,
        role: User.role,
        fcmToken: User.fcmToken,
        referredBy: User.referredBy,
        deviceId: User.deviceId,
        active: User.active,
        _id: User._id,
        referralCode: User.referralCode,
        referrerUserInfo,
        __v: User.__v,
      },
    },
  });
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const match = {};

  if (req.query.role) {
    match.role = req.query.role;
  }

  const users = await User.find(match)

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    Totalusers: users.length,
    users,
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  const { referralCode, deviceId, ...userData } = req.body;

  let referredByUser = null;
  if (referralCode) {
    referredByUser = await User.findOne({ referralCode });
  }

  const newUser = await User.create({
    ...userData,
    referredBy: referredByUser ? referredByUser._id : null,
    deviceId: deviceId,
  });

  await DeviceId.create({
    deviceId: deviceId,
    user: newUser._id,
    news: null,
  });

  const referrerUserInfo = referredByUser
    ? { id: referredByUser._id, name: referredByUser.name }
    : null;

  createSendToken(newUser, 201, res, referrerUserInfo);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password'));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in.. please log in to get access.', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }

  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide', etc]. role='user'
    console.log('roles allowed:', roles);
    console.log('user role:', req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('There is no user exist with the provided email ', 404)
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forgot your password, just ignore this email `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('your current password is wrong', 401));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  createSendToken(user, 200, res);
});

exports.gmailLogin = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide email'));
  }

  let user = await User.findOne({ email });

  if (!user) {
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user = await User.create({
      email,
      password: hashedPassword,
    });
  }

  createSendToken(user, 200, res);
});

function generateRandomPassword() {
  const randomString = require('crypto').randomBytes(8).toString('hex');
  return randomString;
}
