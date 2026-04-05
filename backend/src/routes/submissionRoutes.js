const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  submitForm,
  getMySubmissions,
  getSubmissionById,
  getPendingApprovals,
  actOnSubmission,
  generateSubmissionPDF,
} = require("../controllers/submissionController");

const protect = require("../middleware/authMiddleware");

// Multer — memory storage so we get req.file.buffer
const upload = multer({ storage: multer.memoryStorage() });

// Submit form (multipart so photo file can be uploaded)
router.post("/", protect, upload.single("responses[photo]"), submitForm);

// Get my submissions (history)
router.get("/me", protect, getMySubmissions);

// List submissions pending approval for current user
// NOTE: must be defined BEFORE /:id to avoid "pending" being treated as an id
router.get("/pending/list", protect, getPendingApprovals);

// Get single submission (for view / edit-as-new)
router.get("/:id", protect, getSubmissionById);

// Approve / reject a submission
router.post("/:id/act", protect, actOnSubmission);

// Download submission PDF
router.get("/:id/pdf", protect, generateSubmissionPDF);

module.exports = router;