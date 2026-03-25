import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";

const initialValues = {
  salutation: "Dr.",
  fullName: "",
  designation: "",
  department: "",
  employeeSignatureName: "",
  empNo: "",
  place: "",
  declarationDate: "",
};

const lineInputSx = {
  minWidth: 160,
  "& .MuiInputBase-input": {
    pb: 0.35,
    fontSize: 18,
  },
  "& .MuiInput-underline:before": {
    borderBottomColor: "#222",
  },
  "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
    borderBottomColor: "#222",
  },
};

const inlineField = {
  variant: "standard",
  size: "small",
  InputLabelProps: { shrink: false },
};

const GenAdminForm = () => {
  const location = useLocation();
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    const prefill = location.state?.prefill;
    if (prefill && typeof prefill === "object") {
      setValues((prev) => ({ ...prev, ...prefill }));
    }
  }, [location.state]);

  React.useEffect(() => {
    const loadTemplate = async () => {
      try {
        const { data } = await API.get("/forms/general-administration-self-declaration/template");
        setTemplateId(data?._id || "");
      } catch {
        setError("Failed to load declaration template.");
      }
    };
    loadTemplate();
  }, []);

  const canSubmit = useMemo(() => {
    return Object.values(values).every((v) => String(v).trim() !== "");
  }, [values]);

  const handleChange = (name) => (event) => {
    setValues((prev) => ({ ...prev, [name]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const submitDeclaration = async () => {
    if (!canSubmit) {
      setError("Please fill all details before submitting.");
      return null;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!templateId) {
        setError("Declaration template is not ready. Please retry.");
        return null;
      }

      const payload = {
        templateId,
        responses: values,
      };

      if (location.state?.parentSubmissionId) {
        payload.parentSubmissionId = location.state.parentSubmissionId;
      }

      const { data } = await API.post("/submissions", payload);
      setSubmissionId(data._id);
      setSuccess("Declaration submitted successfully. It is visible in My Submissions.");
      return data._id;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save declaration.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const openPdf = async () => {
    let id = submissionId;

    if (!id) {
      id = await submitDeclaration();
      if (!id) return;
    }

    setPdfLoading(true);
    setError("");

    try {
      const response = await API.get(`/submissions/${id}/pdf`, {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const pdfWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");

    //   if (!pdfWindow) {
    //     setError("Popup was blocked. Please allow popups and try again.");
    //     return;
    //   }

      setSuccess("PDF opened in new tab. Use browser print to print it.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Gen Admin Declaration Form
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          Back to Forms
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 4 }, border: "1px solid #d8d8d8" }}>
        <Typography
          variant="h4"
          align="center"
          sx={{ textDecoration: "underline", fontWeight: 700, letterSpacing: 0.5, mb: 4 }}
        >
          DECLARATION
        </Typography>

        <Box sx={{ fontSize: 18, lineHeight: 2.05 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 1 }}>
            <Typography sx={{ fontSize: 18, lineHeight: 1.4 }}>I,</Typography>
            <TextField
              select
              value={values.salutation}
              onChange={handleChange("salutation")}
              sx={{ ...lineInputSx, minWidth: 110 }}
              {...inlineField}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="Dr.">Dr.</MenuItem>
              <MenuItem value="Mr.">Mr.</MenuItem>
              <MenuItem value="Ms.">Ms.</MenuItem>
            </TextField>
            <TextField
              value={values.fullName}
              onChange={handleChange("fullName")}
              placeholder="full name"
              sx={{ ...lineInputSx, minWidth: 280, flex: 1 }}
              {...inlineField}
            />
            <Typography sx={{ fontSize: 18, lineHeight: 1.4 }}>,</Typography>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 1, mt: 1 }}>
            <Typography sx={{ fontSize: 18, lineHeight: 1.4 }}>Designation</Typography>
            <TextField
              value={values.designation}
              onChange={handleChange("designation")}
              placeholder="designation"
              sx={{ ...lineInputSx, minWidth: 220 }}
              {...inlineField}
            />
            <Typography sx={{ fontSize: 18, lineHeight: 1.4 }}>Dept./Section/Centre</Typography>
            <TextField
              value={values.department}
              onChange={handleChange("department")}
              placeholder="department"
              sx={{ ...lineInputSx, minWidth: 220, flex: 1 }}
              {...inlineField}
            />
            <Typography sx={{ fontSize: 18, lineHeight: 1.4 }}>,</Typography>
          </Box>

          <Typography sx={{ mt: 2, fontSize: 18 }}>
            IIT Patna declare that there is nothing adverse against me in the Police record either
            criminally or politically, which would render me un-suitable for employment under the
            Govt. of India / IIT Patna.
          </Typography>

          <Typography sx={{ mt: 3, fontSize: 18 }}>
            I, solemnly affirm that the above declaration is true and I understand that furnishing
            of false information or suppression of any factual information, which come to notice of the
            authorities of the Institute at any time during my service would be a disqualification and I
            shall be liable to be dismissed from the service of the Institute.
          </Typography>
        </Box>

        <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: { xs: "100%", sm: 340 } }}>
            <Box sx={{ borderTop: "1px solid #111", pt: 0.75 }}>
              <Typography align="center" fontWeight={700}>
                SIGNATURE OF THE EMPLOYEE
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: "grid", gap: 1.6 }}>
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                <Typography sx={{ minWidth: 58 }}>Name</Typography>
                <Typography>:</Typography>
                <TextField
                  value={values.employeeSignatureName}
                  onChange={handleChange("employeeSignatureName")}
                  placeholder="employee name"
                  fullWidth
                  {...inlineField}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                <Typography sx={{ minWidth: 58 }}>Emp_No.</Typography>
                <Typography>:</Typography>
                <TextField
                  value={values.empNo}
                  onChange={handleChange("empNo")}
                  placeholder="employee number"
                  fullWidth
                  {...inlineField}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                <Typography sx={{ minWidth: 58 }}>Place</Typography>
                <Typography>:</Typography>
                <TextField
                  value={values.place}
                  onChange={handleChange("place")}
                  placeholder="place"
                  fullWidth
                  {...inlineField}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                <Typography sx={{ minWidth: 58 }}>Date</Typography>
                <Typography>:</Typography>
                <TextField
                  type="date"
                  value={values.declarationDate}
                  onChange={handleChange("declarationDate")}
                  fullWidth
                  {...inlineField}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography fontWeight={700}>To</Typography>
          <Typography fontWeight={700}>The Director</Typography>
          <Typography fontWeight={700}>IIT Patna</Typography>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            {success}
          </Typography>
        )}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={submitDeclaration} disabled={saving || pdfLoading}>
            {saving ? <CircularProgress size={18} /> : "Save Declaration"}
          </Button>
          <Button variant="contained" onClick={openPdf} disabled={saving || pdfLoading}>
            {pdfLoading ? <CircularProgress color="inherit" size={18} /> : "Open PDF / Print"}
          </Button>
        </Box>
      </Paper>

      {submissionId && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="text" onClick={() => navigate("/submissions")}>Go to My Submissions</Button>
        </Box>
      )}
    </Container>
  );
};

export default GenAdminForm;
