const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');

function authMiddleware(req, _res, next) {
  const cookieName = process.env.JWT_COOKIE_NAME || 'token';
  const token = req.cookies[cookieName];
  if (!token) return next(new AppError('Unauthorized: missing token.', 401));

  try {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET not configured.');

    const payload = jwt.verify(token, secret);
    req.user = { userId: payload.userId };
    next();
  } catch (e) {
    next(new AppError('Unauthorized: invalid token.', 401));
  }
}

module.exports = { authMiddleware, requireAuth: authMiddleware };

