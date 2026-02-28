const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
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