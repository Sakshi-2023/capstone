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
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import API from "../services/api";

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
              initial[f.name] = "";
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
    <Container maxWidth="sm">
      <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="img"
          src="/iitp.jpg"
          alt="IITP logo"
          sx={{ width: 46, height: 46, objectFit: "contain", borderRadius: 1 }}
        />
      </Box>
      <Box sx={{ mt: 4, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" fontWeight={600}>
          {template.title}
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          ← All Forms
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {template.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {template.description}
          </Typography>
        )}

        {(template.fields || []).map((field) => {
          const value = values[field.name] ?? "";

          // Radio group (yes/no, male/female, etc.)
          if (field.type === "radio") {
            return (
              <Box key={field.name} sx={{ mt: 2 }}>
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

