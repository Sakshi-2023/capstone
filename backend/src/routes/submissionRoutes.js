const express = require("express");
const router = express.Router();

const {
  submitForm,
  getMySubmissions,
  getSubmissionById,
  getPendingApprovals,
  actOnSubmission,
  generateSubmissionPDF,
} = require("../controllers/submissionController");

const protect = require("../middleware/authMiddleware");

// Submit form
router.post("/", protect, submitForm);

// Get my submissions (history)
router.get("/me", protect, getMySubmissions);

// Get single submission (for view / edit-as-new)
router.get("/:id", protect, getSubmissionById);

// List submissions pending approval for current user
router.get("/pending/list", protect, getPendingApprovals);

// Approve / reject a submission
router.post("/:id/act", protect, actOnSubmission);

// Download submission PDF
router.get("/:id/pdf", protect, generateSubmissionPDF);

module.exports = router;