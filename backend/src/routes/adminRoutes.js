const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const {
  bulkImport,
  bulkImportStream,
  changeRole,
} = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only .csv files are allowed"));
    }
  },
});

function handleUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}

// Auth for SSE (EventSource cannot send headers; token in query)
function sseAuth(req, res, next) {
  const rawToken =
    req.query.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!rawToken) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
    if (decoded.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
}

router.post("/bulk-import", protect, adminOnly, handleUpload, bulkImport);
router.get("/bulk-import/:jobId/stream", sseAuth, bulkImportStream);
router.patch("/change-role", protect, adminOnly, changeRole);

module.exports = router;
