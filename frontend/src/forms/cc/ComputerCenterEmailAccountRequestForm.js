import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  FormControl,
  Checkbox,
  Label,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { tableFieldSx, borderedCellSx, formContainerSx, formPaperSx } from "../../utils/formStyles";

const TEMPLATE_SLUG = "/forms/computer-center-email-account-request/template";

const initialValues = {
  userType: "faculty", // faculty, staff, projectStaff, student
  date: "",
  empIdRollNoProjectId: "",
  name: "",
  existingEmail: "",
  mobileNo: "",
  department: "",
  phNo: "",
  block: "",
  floor: "",
  roomNo: "",
  preferredEmailId: "",
  emailDomain: "@iitp.ac.in",
  proxyAccount: "",
  daysLimit: "",
  signature: "",
  forwardingAuthorityName: "",
  forwardingAuthorityDesignation: "",
  forwardingAuthoritySignature: "",
  issueDate: "",
  issuerName: "",
  issuerSignature: "",
};

const ComputerCenterEmailAccountRequestForm = () => {
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
      link.setAttribute("download", "email-account-request.pdf");
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
          Computer Center Email Account Request Form
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          Back to Forms
        </Button>
      </Box>

      <Paper sx={formPaperSx}>
        <Typography variant="h6" align="center" fontWeight={700} sx={{ mb: 1 }}>
          Resource Allocation/Requisition Form
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Computer Center, IIT Patna
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ border: "1px solid #222", p: 3 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                User Information: Faculty/Staff/Project Staff/Student (please tick)
              </Typography>
              <RadioGroup
                row
                name="userType"
                value={values.userType}
                onChange={handleChange}
                sx={{ mb: 3 }}
              >
                <FormControlLabel value="faculty" control={<Radio size="small" />} label="Faculty" />
                <FormControlLabel value="staff" control={<Radio size="small" />} label="Staff" />
                <FormControlLabel value="projectStaff" control={<Radio size="small" />} label="Project Staff" />
                <FormControlLabel value="student" control={<Radio size="small" />} label="Student" />
              </RadioGroup>
              
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>Date:</Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  name="date"
                  type="date"
                  value={values.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 200 }}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 4 }}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Emp. ID/ Roll No./Project ID</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="empIdRollNoProjectId"
                  value={values.empIdRollNoProjectId}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Emp./Student Name:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Existing Email:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="existingEmail"
                  value={values.existingEmail}
                  onChange={handleChange}
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
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Block:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="block"
                  value={values.block}
                  onChange={handleChange}
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Floor:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="floor"
                  value={values.floor}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ gridColumn: "span 2" }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Room No:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="roomNo"
                  value={values.roomNo}
                  onChange={handleChange}
                />
              </Box>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                Requirements of Email/Proxy Account:
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Preferred Email Id:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="preferredEmailId"
                    value={values.preferredEmailId}
                    onChange={handleChange}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Email Domain:</Typography>
                  <RadioGroup
                    name="emailDomain"
                    value={values.emailDomain}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="@iitp.ac.in" control={<Radio size="small" />} label="@iitp.ac.in" />
                  </RadioGroup>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Proxy Account:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="proxyAccount"
                    value={values.proxyAccount}
                    onChange={handleChange}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Days Limit for trainee/conference:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="daysLimit"
                    value={values.daysLimit}
                    onChange={handleChange}
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                For requirements of Desktop/Laptop/Printer etc.
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: "italic", color: "#666" }}>
                Please use the link http://172.16.1.34/StockExchange/
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Signature of the Employee/Student:</Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                name="signature"
                value={values.signature}
                onChange={handleChange}
                required
              />
            </Box>
            
            <Box sx={{ borderTop: "1px solid #222", pt: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                Forwarding Authority (Dean/Head/Incharge):
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>Name:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="forwardingAuthorityName"
                    value={values.forwardingAuthorityName}
                    onChange={handleChange}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>Designation:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="forwardingAuthorityDesignation"
                    value={values.forwardingAuthorityDesignation}
                    onChange={handleChange}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>Signature:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="forwardingAuthoritySignature"
                    value={values.forwardingAuthoritySignature}
                    onChange={handleChange}
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ borderTop: "1px solid #222", pt: 3, mt: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                For CC Office Use
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>Issue Date:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="issueDate"
                    type="date"
                    value={values.issueDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>Issuer Name:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="issuerName"
                    value={values.issuerName}
                    onChange={handleChange}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>Issuer Signature:</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="issuerSignature"
                    value={values.issuerSignature}
                    onChange={handleChange}
                  />
                </Box>
              </Box>
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

export default ComputerCenterEmailAccountRequestForm;
