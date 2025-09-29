import express from "express";
import { signup, login, logout, getMe } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { updateProfile, changePassword } from '../controllers/authController.js';

const router = express.Router();

// Public routes for signup, login, and logout
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected route to get the currently authenticated user's data
// This is used by the frontend to verify the session on page load
router.get("/me", authMiddleware, getMe);
router.put('/me/profile', authMiddleware, updateProfile);
router.put('/me/password', authMiddleware, changePassword);

export default router;