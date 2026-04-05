import React, { useState } from "react";
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
import { formContainerSx, formPaperSx } from "../../utils/formStyles";

const TEMPLATE_SLUG = "/forms/computer-center-faculty-declaration/template";

const initialValues = {
  facultyName: "",
  employeeNo: "",
  designation: "",
  department: "",
  facultySignature: "",
  date: "",
};

/* Inline styles to match the document look */
const docStyles = {
  paper: {
    fontFamily: "serif",
    p: 5,
    maxWidth: 700,
    mx: "auto",
    backgroundColor: "#fff",
    color: "#000",
    lineHeight: 1.8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  title: {
    fontFamily: "serif",
    fontWeight: 700,
    fontSize: "1.3rem",
    textAlign: "center",
    mb: 3,
    color: "#000",
  },
  bodyText: {
    fontFamily: "serif",
    fontSize: "0.97rem",
    mb: 1,
    color: "#000",
  },
  penaltyText: {
    fontFamily: "serif",
    fontWeight: 700,
    fontSize: "0.97rem",
    mt: 2,
    mb: 3,
    color: "#000",
  },
  label: {
    fontFamily: "serif",
    fontSize: "0.97rem",
    color: "#000",
    whiteSpace: "nowrap",
  },
  input: {
    fontFamily: "serif",
    fontSize: "0.97rem",
    "& .MuiInput-underline:before": { borderBottom: "1px solid #000" },
    "& .MuiInput-underline:after": { borderBottom: "1px solid #000" },
    "& input": { fontFamily: "serif", fontSize: "0.97rem", pb: "2px" },
  },
};

const FieldRow = ({ label, name, value, onChange, type }) => (
  <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, mb: 0.5 }}>
    <Typography sx={docStyles.label}>{label}:</Typography>
    <TextField
      variant="standard"
      size="small"
      name={name}
      value={value}
      onChange={onChange}
      type={type || "text"}
      required
      InputLabelProps={type === "date" ? { shrink: true } : undefined}
      sx={{ ...docStyles.input, flexGrow: 1 }}
    />
  </Box>
);

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

      <Paper sx={{ ...formPaperSx, ...docStyles.paper }}>
        {/* Title */}
        <Typography sx={docStyles.title}>
          IIT Patna Website Faculty Declaration Form
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Intro */}
          <Typography sx={docStyles.bodyText}>
            On being given full access to my personal web page, I hereby declare that:
          </Typography>

          {/* Numbered list */}
          <Box component="ol" sx={{ pl: 3, mb: 0 }}>
            {[
              "I will take full responsibility of maintaining it. I will not disclose the web page username and password to anyone.",
              "I will not post any negative or untoward remarks against any fellow faculty member/staff or against the administration of the Institute on the web page.",
              "I will not post any political content on the web page.",
            ].map((item, i) => (
              <Box
                component="li"
                key={i}
                sx={{ ...docStyles.bodyText, mb: 1 }}
              >
                {item}
              </Box>
            ))}
          </Box>

          {/* Penalty clause — bold */}
          <Typography sx={docStyles.penaltyText}>
            In case of violation of any of the above, I understand that I will
            be subjected to penal action by the Institute.
          </Typography>

          {/* Two-column fields: Faculty Name | Employee No */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              columnGap: 4,
              rowGap: 2,
              mb: 2,
            }}
          >
            <FieldRow
              label="Faculty Name"
              name="facultyName"
              value={values.facultyName}
              onChange={handleChange}
            />
            <FieldRow
              label="Employee No"
              name="employeeNo"
              value={values.employeeNo}
              onChange={handleChange}
            />
            <FieldRow
              label="Designation"
              name="designation"
              value={values.designation}
              onChange={handleChange}
            />
            <FieldRow
              label="Department"
              name="department"
              value={values.department}
              onChange={handleChange}
            />
          </Box>

          {/* Faculty Signature — full width */}
          <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ ...docStyles.label, fontWeight: 700 }}>
              Faculty Signature:
            </Typography>
            <TextField
              variant="standard"
              size="small"
              name="facultySignature"
              value={values.facultySignature}
              onChange={handleChange}
              required
              fullWidth
              sx={docStyles.input}
            />
          </Box>

          {/* Date — full width */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ ...docStyles.label, fontWeight: 700 }}>
              Date:
            </Typography>
            <TextField
              variant="standard"
              size="small"
              name="date"
              type="date"
              value={values.date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={docStyles.input}
            />
          </Box>

          {/* Note */}
          <Typography sx={docStyles.bodyText}>
            <Box component="span" sx={{ fontWeight: 700 }}>
              Note
            </Box>
            : Please submit two copies of this form. One will be with the
            website team and the other in your personal file.
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