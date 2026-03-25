const express = require("express");
const {
  createTemplate,
  getAllTemplates,
  getMyTemplates,
  importTemplates,
  importGenAdminTemplates,
} = require("../controllers/formController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create template
router.post("/templates", protect, createTemplate);

// Get all templates
router.get("/templates", protect, getAllTemplates);

// Get my templates
router.get("/templates/me", protect, getMyTemplates);

// Bulk import templates from JSON body (admin)
router.post("/templates/import-json", protect, importTemplates);
router.post("/templates/import-gen-admin", protect, importGenAdminTemplates);

module.exports = router;