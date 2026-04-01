/**
 * Unified Form Styling Constants
 * Ensures all forms use consistent fonts, sizing, and design
 */

// Standard input styling for all form inputs
export const standardInputSx = {
  minWidth: 160,
  "& .MuiInputBase-input": {
    pb: 0.35,
    pt: "1px",
    fontSize: 16,
    lineHeight: 1.4,
  },
  "& .MuiInput-underline:before": {
    borderBottomColor: "#222",
  },
  "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
    borderBottomColor: "#222",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#0d47a1",
  },
};

// Standard input field props (variant, size, etc.)
export const standardInputProps = {
  variant: "standard",
  size: "small",
  InputLabelProps: { shrink: false },
};

// Inline field wrapper for standard forms
export const inlineFieldSx = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: 1,
  mt: 1.5,
};

// Standard label styling
export const labelSx = {
  fontSize: 15,
  fontWeight: 700,
  color: "#1f2937",
};

// Table cell styling for forms with tables
export const tableFieldSx = {
  width: "100%",
  "& .MuiInputBase-root": {
    fontSize: 13,
    py: 0.25,
  },
  "& .MuiInputBase-input": {
    py: 0.4,
    fontSize: 13,
  },
  "& fieldset": {
    border: "none",
  },
};

// Standard bordered cell for tables
export const borderedCellSx = {
  borderRight: "1px solid #222",
  borderBottom: "1px solid #222",
  p: 0.6,
  display: "flex",
  alignItems: "center",
  minHeight: 34,
  fontSize: 13,
};

// Standard form container styling
export const formContainerSx = {
  py: 3,
};

// Standard form paper styling
export const formPaperSx = {
  p: { xs: 2, md: 4 },
  border: "1px solid #d8d8d8",
};

// Standard form title
export const formTitleSx = {
  textDecoration: "underline",
  fontWeight: 700,
  letterSpacing: 0.5,
  mb: 4,
};

// Standard button styling for form submission
export const submitButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 8,
  py: 1.2,
  px: 3,
};
