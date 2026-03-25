import { createTheme } from "@mui/material/styles";

// College-appropriate palette: deep blue primary, teal accent
const formFont = '"IBM Plex Sans", "Segoe UI", Roboto, sans-serif';

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
    fontFamily: formFont,
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
        fullWidth: true,
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: "normal",
        fullWidth: true,
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: formFont,
          fontWeight: 500,
          fontSize: "0.95rem",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontFamily: formFont,
          fontWeight: 600,
          fontSize: "0.95rem",
          color: "#1f2937",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          minHeight: 46,
          backgroundColor: "#ffffff",
          "& input": {
            fontFamily: formFont,
            fontSize: "0.95rem",
            fontWeight: 400,
            lineHeight: 1.4,
          },
          "& textarea": {
            fontFamily: formFont,
            fontSize: "0.95rem",
            lineHeight: 1.5,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontFamily: formFont,
          fontSize: "0.95rem",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: formFont,
          fontSize: "0.95rem",
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontFamily: formFont,
          fontSize: "0.82rem",
        },
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
