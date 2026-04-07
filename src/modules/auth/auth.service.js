const jwt = require('jsonwebtoken');
const User = require('./../users/user.model');
const AppError = require('./../../utils/AppError');

// 1) Generate Tokens (Access & Refresh)
const signTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES }
  );

  return { accessToken, refreshToken };
};

// 2) Register a new user
const registerUser = async (userData) => {
  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });

  // Remove password from output
  newUser.password = undefined;

  const tokens = signTokens(newUser);
  return { user: newUser, tokens };
};

// 3) Login user
const loginUser = async (email, password) => {
  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  // Remove password from output
  user.password = undefined;

  const tokens = signTokens(user);
  return { user, tokens };
};

// 4) Refresh Token logic
const refreshTokens = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('No refresh token provided. Please log in again.', 401);
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token. Please log in.', 401);
  }

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new AppError('The user belonging to this token does no longer exist.', 401);
  }

  // Check if tokenVersion matches (handles immediate invalidation after logout)
  if (currentUser.tokenVersion !== decoded.tokenVersion) {
    throw new AppError('Token has been invalidated. Please log in again.', 401);
  }

  // Generate new tokens
  const tokens = signTokens(currentUser);
  return { user: currentUser, tokens };
};

// 5) Logout user (Invalidate all tokens by incrementing version)
const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
};

// 6) Create first admin securely
const createFirstAdmin = async (userData,  secretKey) => {
  if (secretKey !== process.env.ADMIN_CREATION_KEY) {
    throw new AppError('Invalid admin creation key', 403);
  }

  const newAdmin = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: 'admin',
  });

  newAdmin.password = undefined;
  return newAdmin;
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  createFirstAdmin,
  signTokens
};
