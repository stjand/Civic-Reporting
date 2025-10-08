import knex from '../knex.js';
import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in the .env file.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey@12345678@^*^";
const isProduction = process.env.NODE_ENV === 'production';

// ✅ FIX: Proper cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, location } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // ✅ Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    if (existingUser?.users?.some(u => u.email === email)) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          department: role === "official" ? department : null,
          designation: role === "official" ? designation : null,
          location: role === "official" ? location : null,
        },
        emailRedirectTo: undefined
      },
    });

    if (authError) {
      logger.error(`Supabase Signup Error: ${authError.message}`);
      return res.status(400).json({ success: false, error: authError.message });
    }

    if (!authData.user) {
      return res.status(500).json({ success: false, error: "Signup failed" });
    }

    // ✅ Generate JWT with proper expiration
    const token = jwt.sign(
      { 
        userId: authData.user.id, 
        role,
        email: authData.user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.cookie('jwt', token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: { 
        id: authData.user.id, 
        email: authData.user.email, 
        name,
        role,
        ...authData.user.user_metadata 
      },
    });
  } catch (err) {
    logger.error(`Signup Error: ${err.message}`);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (authError) {
      logger.error(`Login Error: ${authError.message}`);
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    if (!authData.user) {
      return res.status(500).json({ success: false, error: "Login failed" });
    }

    const userRole = authData.user.user_metadata?.role || 'citizen';

    const token = jwt.sign(
      { 
        userId: authData.user.id, 
        role: userRole,
        email: authData.user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.cookie('jwt', token, cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      user: { 
        id: authData.user.id, 
        email: authData.user.email, 
        role: userRole,
        ...authData.user.user_metadata 
      },
    });
  } catch (err) {
    logger.error(`Login Error: ${err.message}`);
    res.status(500).json({ success: false, error: "Login failed" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie('jwt', cookieOptions);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    logger.error(`Logout Error: ${err.message}`);
    res.status(500).json({ success: false, error: "Logout failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await knex("auth.users")
      .where({ id: req.user.id })
      .select("id", "email", "raw_user_meta_data")
      .first();

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      user: { 
        id: user.id, 
        email: user.email, 
        ...user.raw_user_meta_data 
      },
    });
  } catch (err) {
    logger.error(`GetMe Error: ${err.message}`);
    res.status(500).json({ success: false, error: "Failed to fetch user data" });
  }
};

export const getOfficialsList = async (req, res) => {
  try {
    const officials = await knex("auth.users")
      .whereRaw(`raw_user_meta_data->>'role' = ?`, ["official"])
      .select("id", "raw_user_meta_data");

    const cleanOfficials = officials.map(u => ({
      id: u.id,
      name: u.raw_user_meta_data?.name,
      department: u.raw_user_meta_data?.department,
      designation: u.raw_user_meta_data?.designation,
    }));

    res.status(200).json({ success: true, officials: cleanOfficials });
  } catch (err) {
    logger.error(`GetOfficialsList Error: ${err.message}`);
    res.status(500).json({ success: false, error: "Failed to fetch officials" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio } = req.body;
    const userId = req.user.id;

    const profileData = { name, phone, location, bio };

    await knex("profiles").where({ id: userId }).update(profileData);
    const updatedUser = await knex("profiles").where({ id: userId }).select("*").first();

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    logger.error(`Profile update failed: ${err.message}`);
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await knex("users").where({ id: userId }).select("password").first();
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Incorrect password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await knex("users").where({ id: userId }).update({ password: hashedPassword });

    res.status(200).json({ success: true, message: "Password updated" });
  } catch (err) {
    logger.error(`Password change failed: ${err.message}`);
    res.status(500).json({ success: false, error: "Failed to change password" });
  }
};