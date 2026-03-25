import React, { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
        size="medium"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        fullWidth
      />
      <Button variant="contained" size="large" onClick={handleLogin} fullWidth sx={{ py: 1.25 }}>
        Sign In
      </Button>
      <Typography variant="body2" align="center" sx={{ mt: 1 }}>
        <Link to="/forgot-password" style={{ color: "inherit", textDecoration: "underline" }}>
          Forgot Password?
        </Link>
      </Typography>
      <Typography variant="body2" align="center">
        Don&apos;t have an account?{" "}
        <Link to="/register" style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>
          Register
        </Link>
      </Typography>
    </Box>
  );
};

export default Login;
