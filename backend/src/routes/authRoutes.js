import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  getOfficialsList,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import authMiddleware, { roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Public routes ---
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// --- Protected routes ---
router.get("/me", authMiddleware, getMe);
router.put("/me/profile", authMiddleware, updateProfile);
router.put("/me/password", authMiddleware, changePassword);

// --- Admin/Official only route ---
router.get(
  "/officials",
  authMiddleware,
  roleMiddleware(["admin", "official"]),
  getOfficialsList
);

export default router;
