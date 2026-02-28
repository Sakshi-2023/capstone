import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
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
          Login
        </Typography>

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

        <Button variant="contained" onClick={handleLogin}>
          Login
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
