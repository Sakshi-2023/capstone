import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import API from "../services/api";
import IITPFormHeader from "../components/IITPFormHeader";
import { FORM_PAGE_SETTINGS } from "../config/formUiSettings";

const FormFill = () => {
  const { templateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Optional prefill from an existing submission
  const prefill = location.state && location.state.prefill;
  const parentSubmissionId =
    location.state && location.state.parentSubmissionId;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/forms/templates");
        const found = (res.data || []).find((t) => t._id === templateId);
        if (!found) {
          setError("Form template not found");
        } else {
          setTemplate(found);
          // Initialize with prefill if available
          const initial = {};
          if (prefill && typeof prefill === "object") {
            Object.entries(prefill).forEach(([k, v]) => {
              initial[k] = v;
            });
          }
          (found.fields || []).forEach((f) => {
            if (!(f.name in initial)) {
              initial[f.name] = f.type === "table" ? [] : "";
            }
          });
          setValues(initial);
        }
      } catch {
        setError("Failed to load form template");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [templateId, prefill]);

  const handleChange = (name) => (e) => {
    setValues((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const addTableRow = (field) => {
    const cols = Array.isArray(field.columns) ? field.columns : [];
    const emptyRow = cols.reduce((acc, col) => ({ ...acc, [col]: "" }), {});
    setValues((prev) => {
      const current = Array.isArray(prev[field.name]) ? prev[field.name] : [];
      return { ...prev, [field.name]: [...current, emptyRow] };
    });
  };

  const updateTableCell = (fieldName, rowIndex, column, value) => {
    setValues((prev) => {
      const rows = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [];
      if (!rows[rowIndex]) rows[rowIndex] = {};
      rows[rowIndex] = { ...rows[rowIndex], [column]: value };
      return { ...prev, [fieldName]: rows };
    });
  };

  const deleteTableRow = (fieldName, rowIndex) => {
    setValues((prev) => {
      const rows = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [];
      rows.splice(rowIndex, 1);
      return { ...prev, [fieldName]: rows };
    });
  };

  const handleSubmit = async () => {
    if (!template) return;
    setSubmitting(true);
    setError("");
    try {
      const responses = { ...values };
      const body = {
        templateId: template._id,
        responses,
      };
      if (parentSubmissionId) {
        body.parentSubmissionId = parentSubmissionId;
      }
      await API.post("/submissions", body);
      navigate("/submissions");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit form. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!template) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography color="error">{error || "Form not found"}</Typography>
          <Button sx={{ mt: 2 }} onClick={() => navigate("/forms")}>
            Back to Forms
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ pl: FORM_PAGE_SETTINGS.leftPadding, pr: FORM_PAGE_SETTINGS.rightPadding }}>
      <Box sx={{ mt: 4, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" fontWeight={600}>
          {template.title}
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          ← All Forms
        </Button>
      </Box>

      <Paper sx={{ p: 2.5 }}>
        <IITPFormHeader />
        {template.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: FORM_PAGE_SETTINGS.compactSpacing, mt: 1.2 }}>
            {template.description}
          </Typography>
        )}

        {(template.fields || []).map((field) => {
          const value = values[field.name] ?? "";

          // Radio group (yes/no, male/female, etc.)
          if (field.type === "radio") {
            return (
              <Box key={field.name} sx={{ mt: FORM_PAGE_SETTINGS.compactSpacing }}>
                <FormControl component="fieldset" required={field.required}>
                  <FormLabel component="legend">{field.label}</FormLabel>
                  <RadioGroup
                    row
                    value={value}
                    onChange={handleChange(field.name)}
                  >
                    {(field.options || []).map((opt) => (
                      <FormControlLabel
                        key={opt}
                        value={opt}
                        control={<Radio />}
                        label={opt}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
            );
          }

          const commonProps = {
            key: field.name,
            label: field.label,
            fullWidth: true,
            required: field.required,
            value,
            onChange: handleChange(field.name),
            margin: "normal",
          };

          if (field.type === "textarea") {
            return (
              <TextField
                {...commonProps}
                multiline
                minRows={3}
              />
            );
          }

          if (field.type === "select") {
            return (
              <TextField
                {...commonProps}
                select
              >
                {(field.options || []).map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            );
          }

          if (field.type === "number") {
            return <TextField {...commonProps} type="number" />;
          }

          if (field.type === "date") {
            return (
              <TextField
                {...commonProps}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            );
          }

          if (field.type === "table") {
            const rows = Array.isArray(values[field.name]) ? values[field.name] : [];
            const columns = Array.isArray(field.columns) ? field.columns : [];
            return (
              <Box key={field.name} sx={{ mt: FORM_PAGE_SETTINGS.compactSpacing }}>
                <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
                  {field.label}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {columns.map((col) => (
                          <TableCell key={col}>{col}</TableCell>
                        ))}
                        <TableCell width={80}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, rowIndex) => (
                        <TableRow key={`${field.name}-${rowIndex}`}>
                          {columns.map((col) => (
                            <TableCell key={`${field.name}-${rowIndex}-${col}`}>
                              <TextField
                                size="small"
                                fullWidth
                                value={row[col] || ""}
                                onChange={(e) =>
                                  updateTableCell(field.name, rowIndex, col, e.target.value)
                                }
                              />
                            </TableCell>
                          ))}
                          <TableCell>
                            <Button
                              color="error"
                              size="small"
                              onClick={() => deleteTableRow(field.name, rowIndex)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button sx={{ mt: 1 }} variant="outlined" onClick={() => addTableRow(field)}>
                  Add Row
                </Button>
              </Box>
            );
          }

          // default text
          return <TextField {...commonProps} />;
        })}

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/forms")}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FormFill;

