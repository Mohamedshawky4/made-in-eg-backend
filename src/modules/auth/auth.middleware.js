const jwt = require('jsonwebtoken');
const AppError = require('./../../utils/AppError');
const User = require('./../users/user.model');

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    // Since we're using tokenVersion on refresh tokens for hard-logout, 
    // the access token is short-lived. We don't necessarily need to check tokenVersion 
    // here unless we want immediate invalidation everywhere (which adds DB query overhead).
    // The current query already fetches user, so checking tokenVersion is feasible if we embedded it in AccessToken.
    // For now, Access token naturally expires, refresh gets blocked if tokenVersion changed.

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    next(err); // Central error handler will catch jsonwebtoken errors
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
