import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import API from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      await API.post("/auth/forgot-password", { email });
      alert("Password reset link sent to your email!");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="body2" align="center" color="text.secondary">
        Enter your registered email address and we&apos;ll send you a link to reset your password.
      </Typography>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />
      <Button variant="contained" size="large" onClick={handleForgotPassword} fullWidth sx={{ py: 1.25 }}>
        Send Reset Link
      </Button>
      <Typography variant="body2" align="center" sx={{ mt: 1 }}>
        <Link to="/" style={{ color: "inherit", textDecoration: "underline" }}>
          Back to Login
        </Link>
      </Typography>
    </Box>
  );
};

export default ForgotPassword;