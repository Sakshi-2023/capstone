import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { formContainerSx, formPaperSx } from "../../utils/formStyles";

const TEMPLATE_SLUG = "/forms/computer-center-faculty-performa/template";

const emptyHaq = { degree: "", subject: "", university: "", year: "" };

/** Ensure HAQ is always an array of 3 row objects */
const normalizeHaq = (raw) => {
  let arr = [];
  if (typeof raw === "string") {
    try { arr = JSON.parse(raw); } catch { arr = []; }
  } else if (Array.isArray(raw)) {
    arr = raw;
  }
  // Pad / trim to exactly 3 rows
  const rows = [0, 1, 2].map((i) => ({ ...emptyHaq, ...(arr[i] || {}) }));
  return rows;
};

const initialValues = {
  name: "",
  designation: "",
  department: "",
  highestAcademicQualification: [{ ...emptyHaq }, { ...emptyHaq }, { ...emptyHaq }],
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
  photo: null,
};

/* ── shared style tokens ── */
const FONT = "serif";
const BORDER = "1px solid #222";

const cellSx = {
  border: BORDER,
  px: 1,
  py: "6px",
  fontFamily: FONT,
  fontSize: "0.9rem",
};

const labelCellSx = {
  ...cellSx,
  width: 180,
  minWidth: 180,
  verticalAlign: "top",
  backgroundColor: "#fff",
};

const inputSx = {
  width: "100%",
  fontFamily: FONT,
  fontSize: "0.9rem",
  border: "none",
  outline: "none",
  background: "transparent",
  resize: "vertical",
  padding: 0,
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
      setValues((prev) => ({
        ...prev,
        ...prefill,
        // Always normalize so it's a proper array regardless of prefill format
        highestAcademicQualification: normalizeHaq(
          prefill.highestAcademicQualification ?? prev.highestAcademicQualification
        ),
      }));
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

  // Handle changes inside the HAQ sub-table
  const handleHaqChange = (rowIndex, field, value) => {
    setValues((prev) => {
      const updated = prev.highestAcademicQualification.map((row, i) =>
        i === rowIndex ? { ...row, [field]: value } : row
      );
      return { ...prev, highestAcademicQualification: updated };
    });
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("templateId", templateId);

    // Append all scalar fields
    const scalarFields = [
      "name", "designation", "department", "phoneOffice", "iitpEmailId",
      "personalWebpage", "researchAreas", "otherInterests", "coursesTaught",
      "noOfPhDStudents", "professionalExperience", "awardsHonours",
      "memberOfProfessionalBodies", "books", "publications", "presentations",
    ];
    scalarFields.forEach((f) => fd.append(`responses[${f}]`, values[f] || ""));

    // Append HAQ as JSON string
    fd.append(
      "responses[highestAcademicQualification]",
      JSON.stringify(values.highestAcademicQualification)
    );

    // Append photo file if present
    if (values.photo instanceof File) {
      fd.append("responses[photo]", values.photo);
    }

    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await API.post("/submissions", buildFormData(), {
        headers: { "Content-Type": "multipart/form-data" },
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

      <Paper sx={{ ...formPaperSx, fontFamily: FONT, p: 4 }}>
        {/* Title */}
        <Typography
          align="center"
          sx={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: "1.1rem",
            textDecoration: "underline",
            mb: 2,
            color: "#000",
          }}
        >
          Performa for Faculty Home Page
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              border: BORDER,
              fontFamily: FONT,
              fontSize: "0.9rem",
              color: "#000",
            }}
          >
            <Box component="tbody">

              {/* ── Row 1: Name | Photograph (rowSpan=3 covers Name, Designation, Department) ── */}
              <Box component="tr">
                <Box component="td" sx={labelCellSx}>Name</Box>
                <Box component="td" sx={{ ...cellSx, borderLeft: "none" }}>
                  <input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    style={{ ...inputSx, height: 24 }}
                  />
                </Box>
                {/* Photograph cell — rowSpan=3 so it lines up with Name/Designation/Department only */}
                <Box
                  component="td"
                  rowSpan={3}
                  sx={{
                    ...cellSx,
                    borderLeft: "none",
                    width: 200,
                    minWidth: 200,
                    verticalAlign: "top",
                  }}
                >
                  <Typography sx={{ fontSize: "0.85rem", fontFamily: FONT, mb: 1 }}>
                    Photograph / send through email
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    name="photo"
                    onChange={handleChange}
                    style={{ fontSize: "0.8rem", width: "100%" }}
                  />
                  {/* Preview uploaded photo */}
                  {values.photo instanceof File && (
                    <Box
                      component="img"
                      src={URL.createObjectURL(values.photo)}
                      alt="preview"
                      sx={{ mt: 1, width: "100%", maxHeight: 120, objectFit: "contain" }}
                    />
                  )}
                </Box>
              </Box>

              {/* ── Row 2: Designation ── */}
              <Box component="tr">
                <Box component="td" sx={labelCellSx}>Designation</Box>
                <Box component="td" sx={{ ...cellSx, borderLeft: "none" }}>
                  <input
                    name="designation"
                    value={values.designation}
                    onChange={handleChange}
                    style={{ ...inputSx, height: 24 }}
                  />
                </Box>
              </Box>

              {/* ── Row 3: Department ── */}
              <Box component="tr">
                <Box component="td" sx={labelCellSx}>Department</Box>
                <Box component="td" sx={{ ...cellSx, borderLeft: "none" }}>
                  <input
                    name="department"
                    value={values.department}
                    onChange={handleChange}
                    style={{ ...inputSx, height: 24 }}
                  />
                </Box>
              </Box>

              {/* ── Row 4: Highest Academic Qualification — colSpan=2 so photo column is NOT included ── */}
              <Box component="tr">
                <Box component="td" sx={{ ...labelCellSx, verticalAlign: "top" }}>
                  Highest Academic<br />Qualification
                </Box>
                <Box
                  component="td"
                  colSpan={2}
                  sx={{ ...cellSx, borderLeft: "none", p: 0 }}
                >
                  <Box
                    component="table"
                    sx={{ width: "100%", borderCollapse: "collapse" }}
                  >
                    <Box component="tbody">
                      {/* Header row */}
                      <Box component="tr">
                        {["Degree", "Subject", "University/Institute", "Year"].map((h) => (
                          <Box
                            component="td"
                            key={h}
                            sx={{
                              border: BORDER,
                              px: 1,
                              py: "4px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              width: "25%",
                            }}
                          >
                            {h}
                          </Box>
                        ))}
                      </Box>
                      {/* 3 data rows — wired to state */}
                      {(Array.isArray(values.highestAcademicQualification)
                        ? values.highestAcademicQualification
                        : normalizeHaq(values.highestAcademicQualification)
                      ).map((row, i) => (
                        <Box component="tr" key={i}>
                          {["degree", "subject", "university", "year"].map((field) => (
                            <Box
                              component="td"
                              key={field}
                              sx={{ border: BORDER, px: 1, py: "4px", height: 28 }}
                            >
                              <input
                                value={row[field]}
                                onChange={(e) => handleHaqChange(i, field, e.target.value)}
                                style={{ ...inputSx, height: 20 }}
                              />
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* ── Remaining simple rows ── */}
              {[
                { label: "Phone (Office)", name: "phoneOffice" },
                { label: "IITP Email id", name: "iitpEmailId" },
                { label: "Personal Webpage", name: "personalWebpage" },
                { label: "Research Areas/Areas of Interest", name: "researchAreas", tall: true },
                { label: "Other Interests", name: "otherInterests", tall: true },
                { label: "Courses taught at IITP", name: "coursesTaught", tall: true },
                { label: "No. of PhD Students", name: "noOfPhDStudents" },
                { label: "Professional Experience", name: "professionalExperience", tall: true },
                { label: "Awards & Honours", name: "awardsHonours", tall: true },
                { label: "Member of Professional bodies", name: "memberOfProfessionalBodies", tall: true },
                { label: "Books", name: "books", tall: true },
                { label: "Publications", name: "publications", tall: true },
                { label: "Presentations", name: "presentations", tall: true },
              ].map(({ label, name, tall }) => (
                <Box component="tr" key={name}>
                  <Box component="td" sx={{ ...labelCellSx, verticalAlign: "top" }}>
                    {label}
                  </Box>
                  <Box
                    component="td"
                    colSpan={2}
                    sx={{
                      ...cellSx,
                      borderLeft: "none",
                      height: tall ? 56 : 32,
                      verticalAlign: "top",
                    }}
                  >
                    {tall ? (
                      <textarea
                        name={name}
                        value={values[name]}
                        onChange={handleChange}
                        style={{ ...inputSx, minHeight: 48 }}
                      />
                    ) : (
                      <input
                        name={name}
                        value={values[name]}
                        onChange={handleChange}
                        style={{ ...inputSx, height: 24 }}
                      />
                    )}
                  </Box>
                </Box>
              ))}

            </Box>
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
          )}
          {success && (
            <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>
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