const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User, Wallet } = require('../models');
const { AppError } = require('../utils/errors');

async function register(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || typeof email !== 'string') throw new AppError('Email is required.', 400);
    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new AppError('Password must be at least 8 characters.', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) throw new AppError('Email already registered.', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
    });

    await Wallet.create({ userId: user.id, balanceCents: 0n });

    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) throw new AppError('Email and password are required.', 400);

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) throw new AppError('Invalid credentials.', 401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError('Invalid credentials.', 401);

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new AppError('JWT secret not configured.', 500);

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

    const cookieName = process.env.JWT_COOKIE_NAME || 'token';
    const secure = process.env.JWT_COOKIE_SECURE === 'true';
    const sameSite = process.env.JWT_COOKIE_SAMESITE || 'lax';

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure,
      sameSite,
      // 7d in ms
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const cookieName = process.env.JWT_COOKIE_NAME || 'token';
    const secure = process.env.JWT_COOKIE_SECURE === 'true';
    const sameSite = process.env.JWT_COOKIE_SAMESITE || 'lax';

    // Clear the httpOnly cookie by matching its options.
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body || {};
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (email && email !== user.email) {
      // Check for email uniqueness
      const existing = await User.findOne({ where: { email } });
      if (existing && existing.id !== user.id) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      user.email = email;
    }
    if (typeof name === 'string') user.name = name;
    await user.save();
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getProfile, updateProfile };

