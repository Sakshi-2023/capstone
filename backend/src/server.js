const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const formRoutes = require("./routes/formRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const adminRoutes = require("./routes/adminRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error ❌", err);
  });