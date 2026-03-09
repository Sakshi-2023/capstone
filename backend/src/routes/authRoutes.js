const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const crypto = require("crypto");
const nm = require("nodemailer");
const protect = require("../middleware/authMiddleware");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();
const allowedRoles = ["Faculty", "HOD", "Dean", "Director"];

const transporter = nm.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER ,
        pass: process.env.EMAIL_PASS ,
      },
    });

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const normalizedRole = role
      ? allowedRoles.find((allowedRole) => allowedRole.toLowerCase() === String(role).toLowerCase())
      : undefined;

    if (role && !normalizedRole) {
      return res.status(400).json({
        message: "Invalid role",
        allowedRoles
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: normalizedRole || undefined
    });

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server Error", error });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// GET SELF (Protected)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// GENERATE PROFILE PDF (Protected)
router.get("/generate-pdf", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=profile.pdf"
    );

    doc.pipe(res);

    doc.fontSize(20).text("User Profile", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Role: ${user.role}`);
    doc.text(`Generated At: ${new Date().toLocaleString()}`);

    doc.end();

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetURL = `http://localhost:3000/reset/${resetToken}`;

    if (!transporter) {
      return res.json({
        message: "Password reset link generated",
        resetURL,
        emailSent: false
      });
    }

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetURL}">here</a> to reset your password.</p>`
    });

    res.json({
      message: "Password reset email sent",
      emailSent: true
    });

  } catch (error) {
    if (error.code === "EAUTH") {
      return res.status(500).json({
        message: "Email service authentication failed. Gmail rejected the configured credentials.",
      });
    }

    res.status(500).json({ message: "Server Error", error });
  }
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  try {
    const crypto = require("crypto");
    const bcrypt = require("bcryptjs");

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
