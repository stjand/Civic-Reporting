import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// NOTE: Assuming db is imported from a file named knex.js
// If your db import is from './knex.js', you may need to update this line:
import db from "../knex.js"; 

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Helper for dynamic cookie settings (CRITICAL FIX FOR LOCAL/DEPLOYED)
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  // CRITICAL: 'secure' must be true for sameSite: 'none' (for deployment/HTTPS)
  secure: isProduction, 
  // 🟢 FIX: 'Lax' allows cross-port (http://localhost:5173 -> http://localhost:3001). 
  // 'none' is required for cross-domain deployment (HTTPS only).
  // Your code previously used 'strict' here, causing local failure.
  sameSite: isProduction ? 'none' : 'Lax', 
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, location } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (role === "official" && (!department || !designation || !location)) {
      return res.status(400).json({ error: "Missing official details" });
    }

    // Check if user already exists
    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db("users")
      .insert({
        name,
        email,
        password: hashedPassword,
        role,
        department: role === "official" ? department : null,
        designation: role === "official" ? designation : null,
        location: role === "official" ? location : null,
      })
      .returning(["id", "name", "email", "role", "department", "designation", "location"]);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    // Set HTTP-only cookie using the corrected options
    res.cookie('jwt', token, cookieOptions);

    res.status(201).json({ 
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        location: user.location
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await db("users").where({ email }).first();

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    // Set HTTP-only cookie using the corrected options
    res.cookie('jwt', token, cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        location: user.location
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

export const logout = async (req, res) => {
  try {
    // Need to remove maxAge for clearing the cookie, but keep other settings
    const clearCookieOptions = {
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite
    };
    
    res.clearCookie('jwt', clearCookieOptions);
    
    res.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Logout failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await db("users")
      .where({ id: req.user.id })
      .select('id', 'name', 'email', 'role', 'department', 'designation', 'location')
      .first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get user data" });
  }
};