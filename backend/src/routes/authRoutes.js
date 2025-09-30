// File: authRoutes.js (FIXED - ADDED OFFICIALS ROUTE)

import express from "express";
// 🟢 CHANGE: Added getOfficialsList
import { signup, login, logout, getMe, getOfficialsList } from "../controllers/authController.js"; 
import authMiddleware, { roleMiddleware } from "../middleware/authMiddleware.js";
import { updateProfile, changePassword } from '../controllers/authController.js';

const router = express.Router();

// Public routes for signup, login, and logout
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/me", authMiddleware, getMe);
router.put('/me/profile', authMiddleware, updateProfile);
router.put('/me/password', authMiddleware, changePassword);

// 🟢 NEW ROUTE: Get list of officials for assignment
router.get("/officials", authMiddleware, roleMiddleware(['admin', 'official']), getOfficialsList);

export default router;