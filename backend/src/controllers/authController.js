const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const User = require("../models/User");

const ALLOWED_ROLES = ["Faculty", "HOD", "Dean", "Director"];
const ALLOWED_EMAIL_DOMAIN = "@iitp.ac.in";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (!normalizedEmail.endsWith(ALLOWED_EMAIL_DOMAIN)) {
      return res.status(400).json({ message: "Only @iitp.ac.in email addresses are allowed" });
    }

    const normalizedRole = role
      ? ALLOWED_ROLES.find((r) => r.toLowerCase() === String(role).toLowerCase())
      : undefined;

    if (role && !normalizedRole) {
      return res.status(400).json({ message: "Invalid role", allowedRoles: ALLOWED_ROLES });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole || undefined,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    if (!normalizedEmail.endsWith(ALLOWED_EMAIL_DOMAIN)) {
      return res.status(400).json({ message: "Use your institute @iitp.ac.in email" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const generateProfilePdf = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=profile.pdf");
    doc.pipe(res);

    doc.fontSize(22).font("Helvetica-Bold").text("Indian Institute of Technology Patna", { align: "center" });
    doc.fontSize(12).font("Helvetica").text("Faculty & Staff Portal", { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(1.2);
    doc.fontSize(18).font("Helvetica-Bold").text("User Profile", { align: "center" });
    doc.moveDown(1);
    doc.fontSize(13).font("Helvetica");
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Role: ${user.role}`);
    doc.text(`Generated At: ${new Date().toLocaleString()}`);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset/${resetToken}`;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.json({ message: "Password reset link generated", resetURL, emailSent: false });
    }

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request – IIT Patna Forms Portal",
      html: `<p>You requested a password reset for the IIT Patna Forms Portal. Click <a href="${resetURL}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
    });

    res.json({ message: "Password reset email sent", emailSent: true });
  } catch (error) {
    if (error.code === "EAUTH") {
      return res.status(500).json({ message: "Email service authentication failed. Check EMAIL_USER and EMAIL_PASS." });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() },
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
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  register,
  login,
  getMe,
  generateProfilePdf,
  forgotPassword,
  resetPassword,
};
