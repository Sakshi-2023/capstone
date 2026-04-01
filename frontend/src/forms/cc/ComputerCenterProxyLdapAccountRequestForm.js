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

const TEMPLATE_SLUG = "/forms/computer-center-proxy-ldap-request/template";

const initialValues = {
  studentName: "",
  studentRollNo: "",
  instituteName: "",
  email: "",
  mobileNo: "",
  department: "",
  phNo: "",
  address: "",
  proxyAccount: "",
  lastDayDate: "",
  guideName: "",
  guideDesignation: "",
  guideDepartment: "",
  date: "",
  place: "",
  studentSignature: "",
  guideSignature: "",
};

const ComputerCenterProxyLdapAccountRequestForm = () => {
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
        const res = await API.get(TEMPLATE_SLUG);
        setTemplateId(res.data._id);
      } catch (err) {
        console.error("Failed to load template:", err);
      }
    };
    loadTemplate();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await API.post("/submissions", {
        templateId,
        responses: values,
      });

      setSubmissionId(res.data._id);
      setSuccess("Form submitted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit form");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!submissionId) return;
    setPdfLoading(true);
    try {
      const res = await API.get(`/submissions/${submissionId}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "proxy-ldap-account-request.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={formContainerSx}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Computer Center Proxy LDAP Request Form
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          Back to Forms
        </Button>
      </Box>

      <Paper sx={formPaperSx}>
        <Typography variant="h6" align="center" fontWeight={700} sx={{ mb: 1 }}>
          Requisition Form for Trainee
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Computer Center, IIT Patna
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ border: "1px solid #222", p: 3 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                User Information:
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Student Name:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="studentName"
                    value={values.studentName}
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Student Roll No.</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="studentRollNo"
                    value={values.studentRollNo}
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box sx={{ gridColumn: "span 2" }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Institute/Organization/College Name:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="instituteName"
                    value={values.instituteName}
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Email:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Mobile No:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="mobileNo"
                    value={values.mobileNo}
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Department:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="department"
                    value={values.department}
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Ph. No:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="phNo"
                    value={values.phNo}
                    onChange={handleChange}
                  />
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Address:</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  required
                />
              </Box>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                Requirements of Proxy Account:
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Proxy Account:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="proxyAccount"
                    value={values.proxyAccount}
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Last day date:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="lastDayDate"
                    type="date"
                    value={values.lastDayDate}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                Guide Information:
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Guide Name:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="guideName"
                    value={values.guideName}
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Designation:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="guideDesignation"
                    value={values.guideDesignation}
                    onChange={handleChange}
                    required
                  />
                </Box>
                <Box sx={{ gridColumn: "span 2" }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Department:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="guideDepartment"
                    value={values.guideDepartment}
                    onChange={handleChange}
                    required
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 4 }}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Date:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="date"
                  type="date"
                  value={values.date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Place:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="place"
                  value={values.place}
                  onChange={handleChange}
                  required
                />
              </Box>
            </Box>
            
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4 }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Student Signature:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="studentSignature"
                  value={values.studentSignature}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ flex: 1, ml: 2 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Guide Signature:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="guideSignature"
                  value={values.guideSignature}
                  onChange={handleChange}
                  required
                />
              </Box>
            </Box>
            
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Approved
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                (Guide Signature)
              </Typography>
            </Box>
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

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving && <CircularProgress size={20} />}
            >
              {saving ? "Submitting..." : "Submit Form"}
            </Button>

            {submissionId && (
              <Button
                variant="outlined"
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                startIcon={pdfLoading && <CircularProgress size={20} />}
              >
                {pdfLoading ? "Generating..." : "Download PDF"}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ComputerCenterProxyLdapAccountRequestForm;
