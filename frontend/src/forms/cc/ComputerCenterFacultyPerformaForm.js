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

const TEMPLATE_SLUG = "/forms/computer-center-faculty-performa/template";

const initialValues = {
  name: "",
  designation: "",
  department: "",
  highestAcademicQualification: "",
  phoneOffice: "",
  iitpEmailId: "",
  personalWebpage: "",
  researchAreas: "",
  otherInterests: "",
  coursesTaught: "",
  noOfPhDStudents: "",
  professionalExperience: "",
  awardsHonours: "",
  memberOfProfessionalBodies: "",
  books: "",
  publications: "",
  presentations: "",
  photograph: null,
};

const ComputerCenterFacultyPerformaForm = () => {
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
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setValues((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value || "");
        }
      });

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
      link.setAttribute("download", "faculty-performa.pdf");
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
          Computer Center Faculty Performa Form
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          Back to Forms
        </Button>
      </Box>

      <Paper sx={formPaperSx}>
        <Typography variant="h6" align="center" fontWeight={700} sx={{ mb: 3 }}>
          Performa for Faculty Home Page
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ border: "1px solid #222", p: 3 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Name</Typography>
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
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Photograph / send through email</Typography>
                <input
                  type="file"
                  accept="image/*"
                  name="photograph"
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "8.5px 14px",
                    border: "1px solid rgba(0, 0, 0, 0.23)",
                    borderRadius: "4px",
                    fontSize: "16px"
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Designation</Typography>
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
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Department</Typography>
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
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Highest Academic Qualification</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="highestAcademicQualification"
                value={values.highestAcademicQualification}
                onChange={handleChange}
              />
            </Box>
            
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Phone (Office)</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="phoneOffice"
                  value={values.phoneOffice}
                  onChange={handleChange}
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>IITP Email id</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="iitpEmailId"
                  value={values.iitpEmailId}
                  onChange={handleChange}
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Personal Webpage</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="personalWebpage"
                  value={values.personalWebpage}
                  onChange={handleChange}
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>No. of PhD Students</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="noOfPhDStudents"
                  value={values.noOfPhDStudents}
                  onChange={handleChange}
                />
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Research Areas/Areas of Interest</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="researchAreas"
                value={values.researchAreas}
                onChange={handleChange}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Other Interests</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="otherInterests"
                value={values.otherInterests}
                onChange={handleChange}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Courses taught at IITP</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="coursesTaught"
                value={values.coursesTaught}
                onChange={handleChange}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Professional Experience</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="professionalExperience"
                value={values.professionalExperience}
                onChange={handleChange}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Awards & Honours</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="awardsHonours"
                value={values.awardsHonours}
                onChange={handleChange}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Member of Professional bodies</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="memberOfProfessionalBodies"
                value={values.memberOfProfessionalBodies}
                onChange={handleChange}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Books</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="books"
                value={values.books}
                onChange={handleChange}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Publications</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="publications"
                value={values.publications}
                onChange={handleChange}
              />
            </Box>
            
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Presentations</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="presentations"
                value={values.presentations}
                onChange={handleChange}
              />
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

export default ComputerCenterFacultyPerformaForm;
