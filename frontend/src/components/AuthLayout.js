import React from "react";
import { Box, Container, Typography } from "@mui/material";

const AuthLayout = ({ children, title, subtitle }) => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)",
      py: 4,
      px: 2,
    }}
  >
    <Box sx={{ textAlign: "center", mb: 3 }}>
      <Typography
        variant="h5"
        sx={{
          color: "white",
          fontWeight: 700,
          letterSpacing: 0.5,
        }}
      >
        Indian Institute of Technology Patna
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(255,255,255,0.9)", mt: 0.5 }}
      >
        Faculty & Staff Portal
      </Typography>
    </Box>
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          p: 3.5,
        }}
      >
        {title && (
          <Typography
            variant="h5"
            component="h1"
            align="center"
            sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}
          >
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {subtitle}
          </Typography>
        )}
        {children}
      </Box>
    </Container>
  </Box>
);

export default AuthLayout;
