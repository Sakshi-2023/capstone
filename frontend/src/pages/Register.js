import React, { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    try {
      await API.post("/auth/register", form);
      alert("Registration successful! Please login.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          fullWidth
        />

        <Button variant="contained" onClick={handleRegister}>
          Register
        </Button>

        <Typography variant="body2" align="center">
          Already have an account? <Link to="/">Login</Link>
        </Typography>
      </Box>
  );
};

export default Register;