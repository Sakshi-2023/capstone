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
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        <Typography variant="h4" align="center">
          Forgot Password
        </Typography>

        <Typography variant="body1" align="center">
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        <TextField
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <Button variant="contained" onClick={handleForgotPassword}>
          Send Reset Link
        </Button>

        <Typography variant="body2" align="center">
          Go back to <Link to="/">Login</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default ForgotPassword;