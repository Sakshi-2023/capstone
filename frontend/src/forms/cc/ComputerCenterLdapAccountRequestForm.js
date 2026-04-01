import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { tableFieldSx, borderedCellSx, formContainerSx, formPaperSx } from "../../utils/formStyles";

const TEMPLATE_SLUG = "/forms/computer-center-ldap-account-request/template";

const initialValues = {
  empIdProjectId: "",
  fullName: "",
  department: "",
  phoneMobileNo: "",
  personalEmailId: "",
  address: "",
  iitpEmailId: "",
  validityLastDate: "",
  requestDate: "",
};

const ComputerCenterLdapAccountRequestForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  React.useEffect(() => {
    const prefill = location.state?.prefill;
    if (prefill && typeof prefill === "object") {
      setValues((prev) => ({ ...prev, ...prefill }));
    }
  }, [location.state]);

  React.useEffect(() => {
    const loadTemplate = async () => {
      try {
        const { data } = await API.get(TEMPLATE_SLUG);
        setTemplateId(data?._id || "");
      } catch {
        setError("Failed to load form template.");
      }
    };
    loadTemplate();
  }, []);

  const canSubmit = useMemo(() => {
    const required = [
      "empIdProjectId",
      "fullName",
      "department",
      "phoneMobileNo",
      "personalEmailId",
      "address",
      "validityLastDate",
      "requestDate",
    ];
    return required.every((k) => String(values[k]).trim() !== "");
  }, [values]);

  const handleChange = (name) => (event) => {
    setValues((prev) => ({ ...prev, [name]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const submitForm = async () => {
    if (!canSubmit) {
      setError("Please fill in all required fields before submitting.");
      return null;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!templateId) {
        setError("Form template is not ready. Please retry.");
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
      setSuccess("Form submitted successfully. It is visible in My Submissions.");
      return data._id;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save form.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const openPdf = async () => {
    let id = submissionId;

    if (!id) {
      id = await submitForm();
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
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setSuccess("PDF opened in new tab. Use browser print to print it.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={formContainerSx}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Computer Center LDAP Account Request
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          Back to Forms
        </Button>
      </Box>

      <Paper sx={formPaperSx}>
        <Typography variant="h5" align="center" fontWeight={800} sx={{ letterSpacing: 0.3 }}>
          INDIAN INSTITUTE OF TECHNOLOGY PATNA
        </Typography>
        <Box sx={{ mt: 0.6, mb: 1.3, px: 2 }}>
          <Box sx={{ borderBottom: "4px solid #111", position: "relative", height: 12 }}>
            <Box
              sx={{
                position: "absolute",
                right: 0,
                bottom: -2,
                bgcolor: "#111",
                color: "#fff",
                fontSize: 13,
                px: 1.2,
                lineHeight: 1.4,
                fontWeight: 700,
                letterSpacing: 0.2,
              }}
            >
              COMPUTER CENTRE
            </Box>
          </Box>
        </Box>
        <Typography
          align="center"
          fontWeight={800}
          sx={{ textDecoration: "underline", fontSize: 32 / 2, letterSpacing: 0.2 }}
        >
          REQUEST / REQUISITION FORM
        </Typography>
        <Typography align="center" sx={{ mb: 2.5, mt: 0.2 }}>
          (For LDAP Account)
        </Typography>

        <Box sx={{ border: "1px solid #222", mx: "auto", width: "95%", maxWidth: 760 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "36px 32px 1fr 2.6fr" }}>
            <Box sx={{ ...borderedCellSx, borderBottom: "none", borderRight: "1px solid #222", gridRow: "1 / span 7", justifyContent: "center", alignItems: "flex-start", pt: 1 }}>
              A.
            </Box>
            <Box sx={{ ...borderedCellSx, borderBottom: "1px solid #222", borderRight: "none", gridColumn: "2 / span 3", fontWeight: 500 }}>
              Personal Information (PLEASE FILL IN BLOCK LETTERS)
            </Box>

            <Box sx={borderedCellSx}>1.</Box>
            <Box sx={borderedCellSx}>Emp. ID/Project ID</Box>
            <Box sx={{ ...borderedCellSx, borderRight: "none", p: 0.2 }}>
              <TextField
                variant="outlined"
                placeholder=""
                value={values.empIdProjectId}
                onChange={handleChange("empIdProjectId")}
                sx={tableFieldSx}
              />
            </Box>

            <Box sx={borderedCellSx}>2.</Box>
            <Box sx={borderedCellSx}>Full Name</Box>
            <Box sx={{ ...borderedCellSx, borderRight: "none", p: 0.2 }}>
              <TextField variant="outlined" value={values.fullName} onChange={handleChange("fullName")} sx={tableFieldSx} />
            </Box>

            <Box sx={borderedCellSx}>3.</Box>
            <Box sx={borderedCellSx}>Dept./Section/Centre</Box>
            <Box sx={{ ...borderedCellSx, borderRight: "none", p: 0.2 }}>
              <TextField variant="outlined" value={values.department} onChange={handleChange("department")} sx={tableFieldSx} />
            </Box>

            <Box sx={borderedCellSx}>4.</Box>
            <Box sx={borderedCellSx}>Phone/Mobile No.:</Box>
            <Box sx={{ ...borderedCellSx, borderRight: "none", p: 0.2 }}>
              <TextField variant="outlined" value={values.phoneMobileNo} onChange={handleChange("phoneMobileNo")} sx={tableFieldSx} />
            </Box>

            <Box sx={borderedCellSx}>5.</Box>
            <Box sx={borderedCellSx}>Personal Email-ID</Box>
            <Box sx={{ ...borderedCellSx, borderRight: "none", p: 0.2 }}>
              <TextField variant="outlined" value={values.personalEmailId} onChange={handleChange("personalEmailId")} sx={tableFieldSx} />
            </Box>

            <Box sx={{ ...borderedCellSx, alignItems: "flex-start", pt: 0.8, minHeight: 95 }}>6.</Box>
            <Box sx={{ ...borderedCellSx, alignItems: "flex-start", pt: 0.8, minHeight: 95 }}>Address:</Box>
            <Box sx={{ ...borderedCellSx, borderRight: "none", minHeight: 95, p: 0.2 }}>
              <TextField
                variant="outlined"
                multiline
                rows={3}
                value={values.address}
                onChange={handleChange("address")}
                sx={tableFieldSx}
              />
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "36px 1fr 2.6fr" }}>
            <Box sx={borderedCellSx}>B.</Box>
            <Box sx={borderedCellSx}>IITP Email id (If any):</Box>
            <Box sx={{ ...borderedCellSx, borderRight: "none", p: 0.2 }}>
              <TextField variant="outlined" value={values.iitpEmailId} onChange={handleChange("iitpEmailId")} sx={tableFieldSx} />
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "36px 1fr 2.6fr" }}>
            <Box sx={{ ...borderedCellSx, borderBottom: "none" }}>C.</Box>
            <Box sx={{ ...borderedCellSx, borderBottom: "none", alignItems: "flex-start", pt: 0.8 }}>
              Validity date / Last Date for LDAP account
            </Box>
            <Box sx={{ ...borderedCellSx, borderBottom: "none", borderRight: "none", p: 0.2 }}>
              <TextField
                type="date"
                variant="outlined"
                value={values.validityLastDate}
                onChange={handleChange("validityLastDate")}
                sx={tableFieldSx}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 7, display: "flex", justifyContent: "space-between", px: "8%", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ minWidth: 220 }}>
            <Box sx={{ borderBottom: "1px solid #222", height: 22, mb: 0.8 }} />
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>SIGNATURE OF FACULTY (IN-CHARGE)/ HoD</Typography>
          </Box>

          <Box sx={{ minWidth: 220 }}>
            <Box sx={{ borderBottom: "1px solid #222", height: 22, mb: 0.8 }} />
            <Typography sx={{ fontSize: 12, fontWeight: 700, textAlign: "right" }}>SIGNATURE</Typography>
            <Box sx={{ mt: 1.8, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
              <Typography sx={{ fontSize: 14 }}>Date:</Typography>
              <TextField
                type="date"
                variant="standard"
                value={values.requestDate}
                onChange={handleChange("requestDate")}
                sx={{ width: 140, "& .MuiInputBase-input": { py: 0.2, fontSize: 16 } }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="success.main" sx={{ mt: 1 }}>
            {success}
          </Typography>
        )}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={submitForm} disabled={saving || pdfLoading}>
            {saving ? <CircularProgress size={18} /> : "Save Form"}
          </Button>
          <Button variant="contained" onClick={openPdf} disabled={saving || pdfLoading}>
            {pdfLoading ? <CircularProgress color="inherit" size={18} /> : "Open PDF / Print"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ComputerCenterLdapAccountRequestForm;