import knex from '../knex.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import validator from 'validator';
import 'dotenv/config'; // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Helper to generate a JWT token
 * @param {number} userId - The user's ID
 * @returns {string} - The JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Sets the JWT as an HTTP-only cookie
 * @param {Response} res - Express response object
 * @param {string} token - The JWT token
 */
const setAuthCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true, // Prevents client-side JS access
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// --- Controller Functions ---

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User with this email already exists' });
    }

    // Hash password and insert user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await knex('users').insert({ 
      name, 
      email, 
      password: hashedPassword 
    }).returning(['id', 'name', 'email', 'role']);

    // Generate token and set cookie
    const token = generateToken(user.id);
    setAuthCookie(res, token);

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful', 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('Registration failed:', error);
    res.status(500).json({ success: false, error: 'Internal server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user
    const user = await knex('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate token and set cookie
    const token = generateToken(user.id);
    setAuthCookie(res, token);

    res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('Login failed:', error);
    res.status(500).json({ success: false, error: 'Internal server error during login' });
  }
};

export const logout = (req, res) => {
  // Clear the HTTP-only cookie
  res.clearCookie('jwt', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict' 
  });
  res.status(200).json({ success: true, message: 'Logout successful' });
};

export const getMe = (req, res) => {
  // authMiddleware ensures req.user is populated
  res.status(200).json({ success: true, user: req.user });
};