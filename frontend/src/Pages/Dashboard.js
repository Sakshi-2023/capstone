import React, { useEffect, useState } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      alert("Unauthorized");
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const generatePDF = async () => {
    try {
      const response = await API.get("/auth/generate-pdf", {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "profile.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Error generating PDF");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 5 }}>
        <Typography variant="h4">Dashboard</Typography>

        {user && (
          <>
            <Typography>Name: {user.name}</Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>Role: {user.role}</Typography>
          </>
        )}

        <Box sx={{ marginTop: 2, display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={generatePDF}>
            Generate PDF
          </Button>

          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;