import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  formContainerSx,
  formPaperSx,
  standardInputProps,
  standardInputSx,
} from "../../utils/formStyles";

const TEMPLATE_SLUG = "/forms/security-vehicle-sticker-requition-for-married-scholar/template";

const initialValues = {
  employeeName: "",
  vehicleOwnership: "",
  rollNo: "",
  department: "",
  residentialAddress: "",
  mobileNo: "",
  instituteEmailId: "",
  vehicleNumber: "",
  engineNumber: "",
  chassisNo: "",
  vehicleType: "",
  signatureWithDate: "",
  supervisorRecommendation: "",
  hodRemarks: "",
  officeVehicleStickerNo: "",
  officeDateOfIssue: "",
  officeNote: "",
  securityOfficerSignature: "",
};

const rowShellSx = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  borderBottom: "1px solid #222",
};

const leftCellSx = {
  width: { xs: "100%", md: "41%" },
  borderRight: { xs: "none", md: "1px solid #222" },
  borderBottom: { xs: "1px solid #222", md: "none" },
  p: 1.2,
};

const rightCellSx = {
  flex: 1,
  p: 1.2,
};

const leftLabelSx = {
  fontSize: 15,
  lineHeight: 1.4,
};

const fieldRowSx = {
  display: "flex",
  alignItems: "baseline",
  gap: 1,
  flexWrap: "wrap",
  mb: 1,
};

const smallLabelSx = {
  fontSize: 14,
  whiteSpace: "nowrap",
};

const InlineField = ({ label, fieldName, values, onChange, type = "text", multiline = false, rows = 1 }) => (
  <Box sx={fieldRowSx}>
    <Typography sx={smallLabelSx}>{label}</Typography>
    <TextField
      type={type}
      value={values[fieldName]}
      onChange={onChange(fieldName)}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      sx={{ ...standardInputSx, flex: 1, minWidth: 170 }}
      {...standardInputProps}
    />
  </Box>
);

const SecurityVehicleStickerRequitionForMarriedScholar = () => {
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
    const requiredFields = [
      "employeeName",
      "vehicleOwnership",
      "rollNo",
      "department",
      "residentialAddress",
      "mobileNo",
      "instituteEmailId",
      "vehicleNumber",
      "engineNumber",
      "chassisNo",
      "vehicleType",
    ];

    return requiredFields.every((key) => String(values[key] || "").trim() !== "");
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 1.5, flexWrap: "wrap" }}>
        <Typography variant="h5" fontWeight={700}>
          Vehicle Sticker Requisition - Married Scholar
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          Back to Forms
        </Button>
      </Box>

      <Paper sx={formPaperSx}>
        <Typography
          align="center"
          sx={{
            textDecoration: "underline",
            fontSize: { xs: 22, md: 30 },
            fontWeight: 700,
            lineHeight: 1.15,
          }}
        >
          INDIAN INSTITUTE OF TECHNOLOGY PATNA
        </Typography>

        <Typography align="center" sx={{ fontSize: 18, mt: 0.6 }}>
          REQUISITION FOR VEHICLE STICKER (Resident of Married Accommodation Only)
        </Typography>

        <Box sx={{ mt: 2, border: "1px solid #222" }}>
          <Box sx={rowShellSx}>
            <Box sx={leftCellSx}>
              <Typography sx={leftLabelSx}>Name of the employee: -</Typography>
              <Typography sx={leftLabelSx}>Ownership of the Vehicle: -</Typography>
              <Typography sx={leftLabelSx}>(In case ownership held with</Typography>
              <Typography sx={leftLabelSx}>Spouse/ Mother/Father)</Typography>
            </Box>
            <Box sx={rightCellSx}>
              <InlineField label="Name" fieldName="employeeName" values={values} onChange={handleChange} />
              <InlineField
                label="Ownership"
                fieldName="vehicleOwnership"
                values={values}
                onChange={handleChange}
              />
            </Box>
          </Box>

          <Box sx={rowShellSx}>
            <Box sx={leftCellSx}>
              <Typography sx={leftLabelSx}>Roll No.: -</Typography>
              <Typography sx={{ ...leftLabelSx, mt: 1.2 }}>Department: -</Typography>
            </Box>
            <Box sx={rightCellSx}>
              <InlineField label="Roll No." fieldName="rollNo" values={values} onChange={handleChange} />
              <InlineField label="Department" fieldName="department" values={values} onChange={handleChange} />
            </Box>
          </Box>

          <Box sx={rowShellSx}>
            <Box sx={leftCellSx}>
              <Typography sx={leftLabelSx}>Residential Address: -</Typography>
              <Typography sx={{ ...leftLabelSx, mt: 1.2 }}>Mobile No.: -</Typography>
              <Typography sx={{ ...leftLabelSx, mt: 1.2 }}>Institute e-mail ID</Typography>
            </Box>
            <Box sx={rightCellSx}>
              <InlineField
                label="Address"
                fieldName="residentialAddress"
                values={values}
                onChange={handleChange}
                multiline
                rows={2}
              />
              <InlineField label="Mobile" fieldName="mobileNo" values={values} onChange={handleChange} />
              <InlineField
                label="Institute e-mail"
                fieldName="instituteEmailId"
                values={values}
                onChange={handleChange}
              />
            </Box>
          </Box>

          <Box sx={rowShellSx}>
            <Box sx={leftCellSx}>
              <Typography sx={leftLabelSx}>Vehicle Number: -</Typography>
              <Typography sx={{ ...leftLabelSx, mt: 1.2 }}>Engine Number: -</Typography>
              <Typography sx={{ ...leftLabelSx, mt: 1.2 }}>Chassis No.: -</Typography>
              <Typography sx={{ ...leftLabelSx, mt: 1.2 }}>Type of Vehicle: -</Typography>
            </Box>
            <Box sx={rightCellSx}>
              <InlineField label="Vehicle Number" fieldName="vehicleNumber" values={values} onChange={handleChange} />
              <InlineField label="Engine Number" fieldName="engineNumber" values={values} onChange={handleChange} />
              <InlineField label="Chassis No." fieldName="chassisNo" values={values} onChange={handleChange} />
              <InlineField label="Type of Vehicle" fieldName="vehicleType" values={values} onChange={handleChange} />
            </Box>
          </Box>

          <Box sx={{ p: 1.2 }}>
            <Typography sx={{ fontSize: 16, lineHeight: 1.45 }}>
              I have enclosed self-attested copy of Owner book (RC Book), Driving License,
              Copy of Accommodation allotment letter/mail &amp; Institute identity Card.
            </Typography>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 1 }}>
              <Typography sx={{ fontSize: 16, whiteSpace: "nowrap" }}>Signature with date</Typography>
              <TextField
                value={values.signatureWithDate}
                onChange={handleChange("signatureWithDate")}
                sx={{ ...standardInputSx, minWidth: 220 }}
                {...standardInputProps}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 3, border: "1px solid #222" }}>
          <Box sx={{ ...rowShellSx, minHeight: 70 }}>
            <Box sx={{ ...leftCellSx, width: { xs: "100%", md: "50%" } }}>
              <Typography sx={{ fontSize: 16 }}>Recommendation by Supervisor</Typography>
            </Box>
            <Box sx={rightCellSx}>
              <TextField
                value={values.supervisorRecommendation}
                onChange={handleChange("supervisorRecommendation")}
                multiline
                rows={2}
                fullWidth
                sx={standardInputSx}
                {...standardInputProps}
              />
            </Box>
          </Box>

          <Box sx={{ ...rowShellSx, borderBottom: "none", minHeight: 70 }}>
            <Box sx={{ ...leftCellSx, width: { xs: "100%", md: "50%" } }}>
              <Typography sx={{ fontSize: 16 }}>Remarks by HoD</Typography>
            </Box>
            <Box sx={rightCellSx}>
              <TextField
                value={values.hodRemarks}
                onChange={handleChange("hodRemarks")}
                multiline
                rows={2}
                fullWidth
                sx={standardInputSx}
                {...standardInputProps}
              />
            </Box>
          </Box>
        </Box>

        <Typography
          align="center"
          sx={{ mt: 3, textDecoration: "underline", fontWeight: 700, fontSize: 36 / 2 }}
        >
          For office use
        </Typography>

        <Box sx={{ mt: 2, border: "1px solid #222" }}>
          <Box sx={{ ...rowShellSx, minHeight: 72 }}>
            <Box sx={{ ...leftCellSx, width: { xs: "100%", md: "60%" } }}>
              <InlineField
                label="Vehicle Sticker No."
                fieldName="officeVehicleStickerNo"
                values={values}
                onChange={handleChange}
              />
            </Box>
            <Box sx={{ ...rightCellSx, width: { xs: "100%", md: "40%" } }}>
              <InlineField
                label="Date of issue"
                fieldName="officeDateOfIssue"
                values={values}
                onChange={handleChange}
                type="date"
              />
            </Box>
          </Box>

          <Box sx={{ ...rowShellSx, borderBottom: "none", minHeight: 108 }}>
            <Box sx={{ ...leftCellSx, width: { xs: "100%", md: "60%" } }}>
              <InlineField
                label="Office Note"
                fieldName="officeNote"
                values={values}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Box>
            <Box
              sx={{
                ...rightCellSx,
                width: { xs: "100%", md: "40%" },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <TextField
                value={values.securityOfficerSignature}
                onChange={handleChange("securityOfficerSignature")}
                sx={{ ...standardInputSx, minWidth: 180 }}
                {...standardInputProps}
              />
              <Typography sx={{ fontSize: 16, textAlign: "right", mt: 2 }}>
                Signature of Security Officer
              </Typography>
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

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={submitForm} disabled={saving || pdfLoading}>
            {saving ? <CircularProgress size={18} /> : "Save Form"}
          </Button>
          <Button variant="contained" onClick={openPdf} disabled={saving || pdfLoading}>
            {pdfLoading ? <CircularProgress color="inherit" size={18} /> : "Open PDF / Print"}
          </Button>
        </Box>
      </Paper>

      {submissionId && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="text" onClick={() => navigate("/submissions")}>
            Go to My Submissions
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default SecurityVehicleStickerRequitionForMarriedScholar;
