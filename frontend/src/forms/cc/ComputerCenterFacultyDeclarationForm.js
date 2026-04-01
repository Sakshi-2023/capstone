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

const TEMPLATE_SLUG = "/forms/computer-center-faculty-declaration/template";

const initialValues = {
  facultyName: "",
  employeeNo: "",
  designation: "",
  department: "",
  facultySignature: "",
  date: "",
};

const ComputerCenterFacultyDeclarationForm = () => {
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
      link.setAttribute("download", "faculty-declaration-form.pdf");
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
          IIT Patna Website Faculty Declaration Form
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          Back to Forms
        </Button>
      </Box>

      <Paper sx={formPaperSx}>
        <Typography variant="h6" align="center" fontWeight={700} sx={{ mb: 3 }}>
          IIT Patna Website Faculty Declaration Form
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            On being given full access to my personal web page, I hereby declare that:
            <br /><br />
            1. I will take full responsibility of maintaining it. I will not disclose the web page username and password to anyone.
            <br /><br />
            2. I will not post any negative or untoward remarks against any fellow faculty member/staff or against the administration of the Institute on the web page.
            <br /><br />
            3. I will not post any political content on the web page.
            <br /><br />
            In case of violation of any of the above, I understand that I will be subjected to penal action by the Institute.
          </Typography>

          <Box sx={{ border: "1px solid #222", p: 3, mb: 3 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Faculty Name:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="facultyName"
                  value={values.facultyName}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Employee No:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="employeeNo"
                  value={values.employeeNo}
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
                  name="designation"
                  value={values.designation}
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
            </Box>
            
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Faculty Signature:</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="facultySignature"
                  value={values.facultySignature}
                  onChange={handleChange}
                  required
                />
              </Box>
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
            </Box>
          </Box>

          <Typography variant="body2" sx={{ fontStyle: "italic", mt: 2, mb: 3 }}>
            Note: Please submit two copies of this form. One will be with the website team and the other in your personal file.
          </Typography>

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

export default ComputerCenterFacultyDeclarationForm;
