import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetPassword = async () => {
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await API.post(`/auth/reset-password/${token}`, {
        password: form.password
      });

      alert(res.data.message || "Password reset successfully!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid or expired token");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="New Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={handleChange}
        fullWidth
      />

      <Button variant="contained" size="large" onClick={handleResetPassword} fullWidth sx={{ py: 1.25 }}>
        Update Password
      </Button>
    </Box>
  );
};

export default ResetPassword;