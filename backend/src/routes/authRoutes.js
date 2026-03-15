const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  register,
  login,
  getMe,
  generateProfilePdf,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// GET SELF (Protected)
router.get("/me", protect, getMe);

// GENERATE PROFILE PDF (Protected)
router.get("/generate-pdf", protect, generateProfilePdf);

// FORGOT PASSWORD
router.post("/forgot-password", forgotPassword);

// RESET PASSWORD
router.post("/reset-password/:token", resetPassword);

module.exports = router;
