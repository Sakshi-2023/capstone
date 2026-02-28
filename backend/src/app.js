import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

connectDB();

/* ========= MIDDLEWARE ========= */

// Parse JSON
app.use(express.json());

// Cookies (for JWT later)
app.use(cookieParser());

// Allow frontend later
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

/* ========= ROUTES ========= */

// Health check route
app.get("/", (req, res) => {
  res.send("API is running");
});

/* ========= SERVER ========= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});