import knex from '../knex.js';
import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';
import jwt from "jsonwebtoken";
import { createClient } from '@supabase/supabase-js';
import db from "../knex.js";
// import logger from "../utils/logger.js";

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in the .env file.");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// --- Cookie Settings ---
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'Lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Signs up a new user using Supabase Auth.
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, location } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🟢 FIX: Use the Supabase client to securely create the user.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name,
          role,
          department: role === "official" ? department : null,
          designation: role === "official" ? designation : null,
          location: role === "official" ? location : null,
        },
      },
    });

    if (authError) {
      logger.error(`Supabase Signup Error: ${authError.message}`);
      return res.status(400).json({ error: authError.message });
    }
    if (!authData.user) {
        return res.status(500).json({ error: "Signup succeeded but no user data was returned." });
    }

    // Create our application's session token
    const token = jwt.sign({ userId: authData.user.id, role: role }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie('jwt', token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: { id: authData.user.id, email: authData.user.email, ...authData.user.user_metadata },
    });
  } catch (err) {
    logger.error(`General Signup Error: ${err.message}`);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

/**
 * Logs in a user using Supabase Auth to verify the password.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 🟢 FIX: Use the Supabase client to securely verify the password.
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      logger.error(`Supabase Login Error: ${authError.message}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
     if (!authData.user) {
      return res.status(500).json({ error: "Login succeeded but no user data was returned." });
    }

    // Create our application's session token
    const token = jwt.sign({ userId: authData.user.id, role: authData.user.user_metadata.role }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie('jwt', token, cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      user: { id: authData.user.id, email: authData.user.email, ...authData.user.user_metadata },
    });
  } catch (err) {
    logger.error(`General Login Error: ${err.message}`);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie('jwt', { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'Lax' });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    logger.error(`Logout Error: ${err.message}`);
    res.status(500).json({ error: "Logout failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await db("auth.users")
      .where({ id: req.user.id })
      .select('id', 'email', 'raw_user_meta_data')
      .first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: { id: user.id, email: user.email, ...user.raw_user_meta_data },
    });
  } catch (err) {
    logger.error(`GetMe Error: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

// New function to update a user's profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, location, bio } = req.body;
    const userId = req.user.id;

    // Prepare the data for updating the 'profiles' table
    const profileData = { name, phone, location, bio };
    
    // Update the profile table
    await knex('profiles').where({ id: userId }).update(profileData);
    
    // If the email is being changed, update the 'auth.users' table
    if (email && email !== req.user.email) {
      // NOTE: Supabase handles email changes securely. For a standard setup,
      // you would update the users table directly. Here we focus on the profile.
      // await knex('users').where({ id: userId }).update({ email });
    }

    const [updatedUser] = await knex('profiles').where({ id: userId }).select('*');

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    logger.error(`Profile update failed for user ${req.user.id}: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

// New function to change a user's password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get the user from the database
    const [user] = await knex('users').where({ id: userId }).select('password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect current password' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password in the database
    await knex('users').where({ id: userId }).update({ password: hashedPassword });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    logger.error(`Password change failed for user ${req.user.id}: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
};