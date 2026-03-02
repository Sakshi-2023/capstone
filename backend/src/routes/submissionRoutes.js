const express = require("express");
const router = express.Router();

const {
  submitForm,
  getMySubmissions,
} = require("../controllers/submissionController");

const protect = require("../middleware/authMiddleware");

// Submit form
router.post("/", protect, submitForm);

// Get my submissions
router.get("/me", protect, getMySubmissions);

module.exports = router;