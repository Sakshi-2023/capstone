const express = require("express");
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// In-memory job store. Jobs auto-expire after 10 minutes.
const jobs = new Map();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only .csv files are allowed"));
    }
  }
});

// Wraps multer so fileFilter / limit errors are returned as JSON 400s
// instead of falling through to the default Express error handler.
function handleUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}

// POST /api/admin/bulk-import
// Accepts a CSV file, queues async processing, returns a jobId.
router.post(
  "/bulk-import",
  protect,
  adminOnly,
  handleUpload,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No CSV file uploaded" });
    }

    let rows;
    try {
      rows = parse(req.file.buffer.toString("utf8"), {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid CSV format: " + err.message });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: "CSV file is empty or has no data rows" });
    }

    const jobId = crypto.randomUUID();
    jobs.set(jobId, {
      total: rows.length,
      processed: 0,
      results: [],
      done: false,
      listeners: new Set()
    });

    // Start async processing – does not block the HTTP response
    setImmediate(() => processRows(jobId, rows));

    res.status(202).json({ jobId, total: rows.length });
  }
);

// GET /api/admin/bulk-import/:jobId/stream
// Server-Sent Events endpoint. Auth via query-param token because
// the browser EventSource API cannot send custom headers.
router.get("/bulk-import/:jobId/stream", (req, res) => {
  // Auth: accept token from query string (EventSource can't set headers)
  const rawToken =
    req.query.token ||
    (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!rawToken) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }

  if (decoded.role !== "Admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ message: "Job not found or has expired" });
  }

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  // Replay results that arrived before this connection opened
  for (const result of job.results) {
    send({ type: "row", ...result, total: job.total });
  }

  if (job.done) {
    const created = job.results.filter((r) => r.status === "success").length;
    const failed = job.results.filter((r) => r.status === "failed").length;
    send({ type: "complete", created, failed, total: job.total });
    return res.end();
  }

  // Register listener for future results
  const listener = (result) => {
    if (result === null) {
      // null signals all rows have been processed
      const created = job.results.filter((r) => r.status === "success").length;
      const failed = job.results.filter((r) => r.status === "failed").length;
      send({ type: "complete", created, failed, total: job.total });
      res.end();
    } else {
      send({ type: "row", ...result, total: job.total });
    }
  };

  job.listeners.add(listener);

  req.on("close", () => {
    job.listeners.delete(listener);
  });
});

// ---------------------------------------------------------------------------
// Internal: process CSV rows one by one and push results to in-memory job
// ---------------------------------------------------------------------------
const ALLOWED_ROLES = ["Faculty", "HOD", "Dean", "Director", "Admin"];

async function processRows(jobId, rows) {
  const job = jobs.get(jobId);
  if (!job) return;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    const result = { row: rowNum, name: row.name || "", email: row.email || "" };

    try {
      const { name, email, password, role } = row;

      // Field presence validation
      if (!name || !email || !password) {
        throw new Error(
          "Missing required fields – CSV columns must be: name, email, password, role"
        );
      }

      // Email format validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Invalid email format");
      }

      // Password length validation
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Role validation (defaults to Faculty if column omitted)
      const normalizedRole = role
        ? ALLOWED_ROLES.find(
            (r) => r.toLowerCase() === String(role).trim().toLowerCase()
          )
        : "Faculty";

      if (role && !normalizedRole) {
        throw new Error(
          `Invalid role "${role}". Allowed values: ${ALLOWED_ROLES.join(", ")}`
        );
      }

      // Duplicate check
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        throw new Error("A user with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: normalizedRole || "Faculty"
      });

      result.status = "success";
    } catch (err) {
      result.status = "failed";
      result.reason = err.message;
    }

    job.results.push(result);
    job.processed++;

    // Notify all connected SSE listeners
    for (const listener of job.listeners) {
      listener(result);
    }
  }

  job.done = true;

  // Signal completion to all connected SSE listeners
  for (const listener of job.listeners) {
    listener(null);
  }

  // Remove job from memory after 10 minutes
  setTimeout(() => jobs.delete(jobId), 10 * 60 * 1000);
}

// PATCH /api/admin/change-role
// Body: { email, role }
router.patch("/change-role", protect, adminOnly, async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Both email and role are required" });
    }

    const normalizedRole = ALLOWED_ROLES.find(
      (r) => r.toLowerCase() === String(role).trim().toLowerCase()
    );

    if (!normalizedRole) {
      return res.status(400).json({
        message: `Invalid role "${role}". Allowed values: ${ALLOWED_ROLES.join(", ")}`
      });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: `No user found with email "${email}"` });
    }

    if (user.role === normalizedRole) {
      return res.status(400).json({
        message: `User already has the role "${normalizedRole}"`
      });
    }

    user.role = normalizedRole;
    await user.save();

    res.json({
      message: `Role updated to "${normalizedRole}" for ${user.email}`,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
