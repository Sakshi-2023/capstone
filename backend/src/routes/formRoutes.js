const express = require("express");
const {
  createTemplate,
  getAllTemplates,
  getMyTemplates,
  getGenAdminTemplate,
} = require("../controllers/formController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create template
router.post("/templates", protect, createTemplate);

// Get all templates
router.get("/templates", protect, getAllTemplates);

// Get my templates
router.get("/templates/me", protect, getMyTemplates);

// Hardcoded General Administration Self Declaration template
router.get("/general-administration-self-declaration/template", protect, getGenAdminTemplate);

module.exports = router;