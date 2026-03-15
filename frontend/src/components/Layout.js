import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Forms", path: "/forms" },
  { label: "My Submissions", path: "/submissions" },
  { label: "Approvals", path: "/approvals", roles: ["HOD", "Dean", "Director", "Admin"] },
  { label: "Bulk Import", path: "/admin/bulk-import", roles: ["Admin"] },
];

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    API.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  const handleLogout = () => {
    setAnchorEl(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "primary.main",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Toolbar sx={{ gap: 1, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Typography
              variant="h6"
              component="span"
              sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
              onClick={() => navigate("/dashboard")}
            >
              IIT Patna · Forms Portal
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {visibleNavItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{
                    opacity: location.pathname === item.path ? 1 : 0.85,
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    borderBottom: location.pathname === item.path ? "2px solid" : "none",
                    borderRadius: 0,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user && (
              <>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {user.name}{user.role ? ` (${user.role})` : ""}
                </Typography>
                <IconButton
                  color="inherit"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ ml: 0.5 }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: "secondary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                  </Box>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{ sx: { mt: 1.5, minWidth: 160 } }}
                >
                  <MenuItem onClick={() => { setAnchorEl(null); navigate("/dashboard"); }}>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
