import { createTheme } from "@mui/material/styles";

// College-appropriate palette: deep blue primary, teal accent
const theme = createTheme({
  palette: {
    primary: {
      main: "#0d47a1",
      light: "#5472d3",
      dark: "#002171",
      contrastText: "#fff",
    },
    secondary: {
      main: "#00695c",
      light: "#439889",
      dark: "#003d33",
      contrastText: "#fff",
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 600,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "medium",
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
