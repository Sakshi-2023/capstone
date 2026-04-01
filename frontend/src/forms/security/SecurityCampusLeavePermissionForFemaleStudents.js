import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { standardInputSx, standardInputProps, formContainerSx, formPaperSx, labelSx } from "../../utils/formStyles";

const TEMPLATE_SLUG = "/forms/security-campus-leave-permission-female/template";

const initialValues = {
  name: "",
  rollNo: "",
  hostelName: "",
  gender: "Female",
  dateOfLeaving: "",
  reasonForLeaving: "",
  companion1Name: "",
  companion1RollNo: "",
  companion2Name: "",
  companion2RollNo: "",
};

// ── Shared sx / prop objects (module-level so they never change identity) ────

const LabeledField = ({ label, fieldName, placeholder, flex, minWidth = 200, values, onChange }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 1, mt: 1.5 }}>
    <Typography sx={labelSx}>{label}</Typography>
    <TextField
      value={values[fieldName]}
      onChange={onChange(fieldName)}
      placeholder={placeholder || ""}
      sx={{ ...standardInputSx, minWidth, flex: flex || 1 }}
      {...standardInputProps}
    />
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────

const SecurityCampusLeavePermissionForFemaleStudents = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Prefill from navigation state
  React.useEffect(() => {
    const prefill = location.state?.prefill;
    if (prefill && typeof prefill === "object") {
      setValues((prev) => ({ ...prev, ...prefill }));
    }
  }, [location.state]);

  // Load template id on mount
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
    const required = ["name", "rollNo", "hostelName", "dateOfLeaving", "reasonForLeaving"];
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
      {/* Top nav */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Campus Leave Permission – Female Students
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          Back to Forms
        </Button>
      </Box>

      <Paper sx={formPaperSx}>
        {/* ── Header ── */}
        <Typography
          variant="h4"
          align="center"
          sx={{ textDecoration: "underline", fontWeight: 700, letterSpacing: 0.5, mb: 0.5 }}
        >
          IIT PATNA
        </Typography>

        <Typography align="left" fontWeight={700} sx={{ mb: 3, fontSize: 15 }}>
          Campus Leaving Permission after 10:00 PM (For Female Students)
        </Typography>

        {/* ── Field 1: Name ── */}
        <LabeledField
          label="1. Name:"
          fieldName="name"
          placeholder="full name"
          values={values}
          onChange={handleChange}
        />

        {/* ── Field 2: Roll No ── */}
        <LabeledField
          label="2. Roll No:"
          fieldName="rollNo"
          placeholder="roll number"
          values={values}
          onChange={handleChange}
        />

        {/* ── Field 3: Hostel Name ── */}
        <LabeledField
          label="3. Hostel Name:"
          fieldName="hostelName"
          placeholder="hostel name"
          values={values}
          onChange={handleChange}
        />

        {/* ── Field 4: Gender (static) ── */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 1.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>4. Gender:</Typography>
          <Typography sx={{ fontSize: 15 }}>Female</Typography>
        </Box>

        {/* ── Field 5: Date of Leaving ── */}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 1, mt: 1.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
            5. Date of leaving IIT Patna campus:
          </Typography>
          <TextField
            type="date"
            value={values.dateOfLeaving}
            onChange={handleChange("dateOfLeaving")}
            sx={{ ...standardInputSx, minWidth: 180 }}
            {...standardInputProps}
          />
        </Box>

        {/* ── Field 6: Reason ── */}
        <Box sx={{ mt: 1.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
            6. Reason for leaving campus after 10:00 pm:{" "}
            <Typography component="span" sx={{ fontWeight: 400, fontSize: 14 }}>
              (Specifically mention the mode of conveyance, boarding point &amp; destination)
            </Typography>
          </Typography>
          <TextField
            value={values.reasonForLeaving}
            onChange={handleChange("reasonForLeaving")}
            placeholder="Enter reason..."
            multiline
            rows={3}
            fullWidth
            variant="standard"
            size="small"
            sx={{
              mt: 1,
              "& .MuiInputBase-input": { fontSize: 15, pb: 0 },
              "& .MuiInput-underline:before": { borderBottomColor: "#222" },
            }}
          />
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* ── Supporting documents note ── */}
        <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>
          (Please also enclose the supporting documents)
        </Typography>

        {/* ── Field 7: Companions ──
            Only "7. Particulars of student(s) who would accompany the female" is bold;
            the rest of the sentence is normal weight. */}
        <Typography sx={{ fontSize: 15, mb: 1.5 }}>
          <Typography component="span" sx={{ fontWeight: 700, fontSize: 15 }}>
            7. Particulars of student(s) who would accompany the{" "}
            <Typography component="span" sx={{ fontWeight: 700, fontSize: 15, fontStyle: "italic" }}>
              female
            </Typography>
          </Typography>
          {" "}student (Maximum two persons can accompany a female student):
        </Typography>

        {/* Companion 1 */}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 2, mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flex: 1, minWidth: 200 }}>
            <Typography sx={{ fontSize: 15 }}>Name</Typography>
            <TextField
              value={values.companion1Name}
              onChange={handleChange("companion1Name")}
              sx={{ ...standardInputSx, flex: 1 }}
              {...standardInputProps}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, minWidth: 180 }}>
            <Typography sx={{ fontSize: 15, whiteSpace: "nowrap" }}>Roll No.</Typography>
            <TextField
              value={values.companion1RollNo}
              onChange={handleChange("companion1RollNo")}
              sx={{ ...standardInputSx, minWidth: 120 }}
              {...standardInputProps}
            />
          </Box>
        </Box>

        {/* Companion 2 */}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flex: 1, minWidth: 200 }}>
            <Typography sx={{ fontSize: 15 }}>Name</Typography>
            <TextField
              value={values.companion2Name}
              onChange={handleChange("companion2Name")}
              sx={{ ...standardInputSx, flex: 1 }}
              {...standardInputProps}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, minWidth: 180 }}>
            <Typography sx={{ fontSize: 15, whiteSpace: "nowrap" }}>Roll No.</Typography>
            <TextField
              value={values.companion2RollNo}
              onChange={handleChange("companion2RollNo")}
              sx={{ ...standardInputSx, minWidth: 120 }}
              {...standardInputProps}
            />
          </Box>
        </Box>

        {/* Approval note */}
        <Typography sx={{ fontSize: 13, mb: 2 }}>
          (Please enclose the appropirate approval &amp; specific purpose for leaving campus to be
          mentioned in the approval)
        </Typography>

        <Divider sx={{ mb: 2.5 }} />

        {/* ── Undertaking ── */}
        <Typography sx={{ fontSize: 13, textAlign: "justify", lineHeight: 1.8 }}>
          I undertake that I have verified that the student(s) accompanying me, whose details are
          filled in above, have prior approval of their respective wardens to leave the campus after
          10:00 PM on the date mentioned in Sl. No. 5 of this form. My parents/guardian are aware
          of my travel plan &amp; I own the responsibilities of late-night travelling.
        </Typography>

        {/* ── Student Signature placeholder ── */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Typography sx={{ fontSize: 14, fontStyle: "italic", color: "text.secondary" }}>
            Signature of the student with date
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* ── Warden Section ── */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14, textDecoration: "underline", mb: 1 }}>
              Remarks of the Warden
            </Typography>
            {/* Hostel stamp circle */}
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                border: "2px solid #c47c2b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 1,
              }}
            >
              <Typography sx={{ fontSize: 11, color: "#c47c2b", textAlign: "center", lineHeight: 1.3 }}>
                Hostel<br />Stamp
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: 14, fontStyle: "italic", color: "text.secondary", mt: 4 }}>
            Signature of warden
          </Typography>
        </Box>

        {/* ── Status messages ── */}
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

        {/* ── Action Buttons ── */}
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

export default SecurityCampusLeavePermissionForFemaleStudents;
