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

const TEMPLATE_SLUG = "/forms/security_undertaking_regarding_worker_conduct_and_responsibility/template";

const initialValues = {
  name: "",
  designation: "",
  firmName: "",
  mobileNo: "",
  emailId: "",
};

const undertakingItems = [
  "I affirm that all the mess workers employed have been thoroughly vetted with respect to their personal background, criminal record, and antecedents, and that they have been found to be of good character.",
  "I take full responsibility for the conduct of all workers while they are within the campus premises and ensure that they do not engage in any inappropriate activities or interactions with students or other residents.",
  "In case any worker is found to be involved in any misconduct, I will take immediate corrective action, including disciplinary measures, and will cooperate fully with the campus authorities for any investigation or resolution required.",
  "I agree to ensure that my mess workers will adhere to all the rules and regulations set forth by IIT Patna, including those related to campus security, interaction with students, and behavior while on duty.",
  "I will provide the copy of their photo ID proof, photo and a list of all current workers to the campus security and ensure that this information is kept up to date at all times.",
];

const paragraphSx = {
  fontSize: 15,
  lineHeight: 1.7,
  textAlign: "justify",
};

const signerRowSx = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: 1,
  mb: 1,
};

const signerLabelSx = {
  fontSize: 15,
  fontWeight: 700,
  minWidth: 110,
};

const SignatoryField = ({ label, fieldName, values, onChange }) => (
  <Box sx={signerRowSx}>
    <Typography sx={signerLabelSx}>{label}:</Typography>
    <TextField
      value={values[fieldName]}
      onChange={onChange(fieldName)}
      sx={{ ...standardInputSx, flex: 1, minWidth: 180 }}
      {...standardInputProps}
    />
  </Box>
);

const SecurityUndertakingRegardingWorkerConductAndResponsibility = () => {
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
      const { signature: ignoredSignature, ...prefillWithoutSignature } = prefill;
      setValues((prev) => ({ ...prev, ...prefillWithoutSignature }));
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
    const requiredFields = ["name", "designation", "firmName", "mobileNo"];
    return requiredFields.every((fieldName) => String(values[fieldName] || "").trim() !== "");
  }, [values]);

  const handleChange = (fieldName) => (event) => {
    setValues((prev) => ({ ...prev, [fieldName]: event.target.value }));
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

      const { signature: ignoredSignature, ...responses } = values;

      const payload = {
        templateId,
        responses,
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

      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
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
          Undertaking - Worker Conduct and Responsibility
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
            fontSize: { xs: 18, md: 24 },
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: 0.2,
          }}
        >
          UNDERTAKING REGARDING WORKER CONDUCT AND RESPONSIBILITY
        </Typography>

        <Box sx={{ mt: 2.4 }}>
          <Typography sx={{ fontSize: 15, lineHeight: 1.55 }}>To,</Typography>
          <Typography sx={{ fontSize: 15, lineHeight: 1.55 }}>The Dean (Students Affairs)</Typography>
          <Typography sx={{ fontSize: 15, lineHeight: 1.55 }}>IIT Patna</Typography>
        </Box>

        <Typography sx={{ fontSize: 15.5, fontWeight: 700, mt: 2.2 }}>
          Subject: Undertaking regarding the Conduct &amp; Responsibility of Mess Workers
        </Typography>

        <Typography sx={{ fontSize: 15, mt: 2 }}>Dear Sir/Madam,</Typography>

        <Typography sx={{ ...paragraphSx, mt: 2 }}>
          The workers employed for food preparation, service, and other related tasks are staying
          within the campus premises and interacting with students and hostel employees of the campus.
        </Typography>

        <Typography sx={{ ...paragraphSx, mt: 1.5 }}>
          I undertake the responsibility to ensure the smooth functioning of the campus environment
          and the safety of the students and to maintain proper conduct among all mess workers. As
          the mess contractor, I am responsible for the behavior, antecedents, and general conduct
          of my employees.
        </Typography>

        <Typography sx={{ fontSize: 15, mt: 1.8 }}>Further, I undertake the following:-</Typography>

        <Box sx={{ mt: 1.2 }}>
          {undertakingItems.map((item, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1.2 }}>
              <Typography sx={{ fontSize: 15, minWidth: 18 }}>{index + 1}.</Typography>
              <Typography sx={paragraphSx}>{item}</Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={{ ...paragraphSx, mt: 1.2, textAlign: "left" }}>
          I am thankful to the IIT Patna Administration for their cooperation.
        </Typography>

        <Typography sx={{ fontSize: 15, mt: 1.6 }}>Best regards,</Typography>

        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ pt: 0.5 }}>
            <Box
              sx={{
                width: 118,
                height: 118,
                borderRadius: "50%",
                border: "2px solid #214f93",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  color: "#d77b2a",
                  textAlign: "center",
                  lineHeight: 1.3,
                  fontWeight: 600,
                }}
              >
                Stamp of
                <br />
                the Firm
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 320 }, maxWidth: 420 }}>
            <Box sx={signerRowSx}>
              <Typography sx={signerLabelSx}>Signature:</Typography>

            </Box>
            <SignatoryField label="Name" fieldName="name" values={values} onChange={handleChange} />
            <SignatoryField label="Designation" fieldName="designation" values={values} onChange={handleChange} />
            <SignatoryField label="Firm's Name" fieldName="firmName" values={values} onChange={handleChange} />
            <SignatoryField label="Mobile No." fieldName="mobileNo" values={values} onChange={handleChange} />
            <SignatoryField label="Email id" fieldName="emailId" values={values} onChange={handleChange} />
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

export default SecurityUndertakingRegardingWorkerConductAndResponsibility;
