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
};

const FONT = "serif";
const BORDER = "1px solid #aaa";

const inputStyle = {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  fontFamily: FONT,
  fontSize: "0.88rem",
  padding: 0,
  boxSizing: "border-box",
};

const cellSx = { border: BORDER, padding: "5px 8px", verticalAlign: "middle" };
const tallCellSx = { ...cellSx, verticalAlign: "top", height: 72 };

const SectionHeading = ({ children }) => (
  <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem", mt: 2.5, mb: 0.8, color: "#000" }}>
    {children}
  </Typography>
);

/* 4-column table for User Information */
const Tbl = ({ children }) => (
  <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", border: BORDER, fontFamily: FONT, fontSize: "0.88rem", color: "#000" }}>
    <Box component="colgroup">
      <Box component="col" sx={{ width: "22%" }} />
      <Box component="col" sx={{ width: "28%" }} />
      <Box component="col" sx={{ width: "22%" }} />
      <Box component="col" sx={{ width: "28%" }} />
    </Box>
    <Box component="tbody">{children}</Box>
  </Box>
);

/* [label | input | label | input] */
const Row2 = ({ l1, n1, l2, n2, type2, values, onChange }) => (
  <Box component="tr">
    <Box component="td" sx={cellSx}>{l1}</Box>
    <Box component="td" sx={cellSx}><input name={n1} value={values[n1]} onChange={onChange} style={inputStyle} /></Box>
    <Box component="td" sx={cellSx}>{l2}</Box>
    <Box component="td" sx={cellSx}><input name={n2} value={values[n2]} onChange={onChange} type={type2 || "text"} style={inputStyle} /></Box>
  </Box>
);

/* [label | input spanning cols 2-4] */
const RowFull = ({ label, name, tall, values, onChange }) => (
  <Box component="tr">
    <Box component="td" sx={tall ? tallCellSx : cellSx}>{label}</Box>
    <Box component="td" colSpan={3} sx={tall ? tallCellSx : cellSx}>
      {tall
        ? <textarea name={name} value={values[name]} onChange={onChange} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
        : <input name={name} value={values[name]} onChange={onChange} style={inputStyle} />}
    </Box>
  </Box>
);

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
    if (prefill && typeof prefill === "object") setValues((prev) => ({ ...prev, ...prefill }));
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
    setError(""); setSuccess(""); setSaving(true);
    try {
      const res = await API.post("/submissions", { templateId, responses: values });
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
      const res = await API.get(`/submissions/${submissionId}/pdf`, { responseType: "blob" });
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

  const p = { values, onChange: handleChange };

  return (
    <Container maxWidth="md" sx={formContainerSx}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Computer Center Proxy LDAP Request Form</Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>Back to Forms</Button>
      </Box>

      <Paper sx={{ ...formPaperSx, fontFamily: FONT, p: 4, color: "#000" }}>

        {/* Header */}
        <Typography align="center" sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.35rem" }}>
          Requisition Form for Trainee
        </Typography>
        <Typography align="center" sx={{ fontFamily: FONT, fontSize: "0.9rem", mb: 1 }}>
          Computer Center, IIT Patna
        </Typography>
        <Box sx={{ borderTop: "1.5px dashed #aaa", mb: 2 }} />

        <Box component="form" onSubmit={handleSubmit}>

          {/* ── User Information ── */}
          <SectionHeading>User Information:</SectionHeading>
          <Tbl>
            <Row2 l1="Student Name:" n1="studentName" l2="Student Roll No." n2="studentRollNo" {...p} />
            <RowFull label="Institute/Organization/College Name:" name="instituteName" {...p} />
            <Row2 l1="Email:" n1="email" l2="Mobile No:" n2="mobileNo" {...p} />
            <Row2 l1="Department:" n1="department" l2="Ph. No:" n2="phNo" {...p} />
            <RowFull label="Address:" name="address" tall {...p} />
          </Tbl>

          {/* ── Requirements of Proxy Account ── */}
          <SectionHeading>Requirements of Proxy Account:</SectionHeading>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", border: BORDER, fontFamily: FONT, fontSize: "0.88rem", color: "#000" }}>
            <Box component="colgroup">
              <Box component="col" sx={{ width: "20%" }} />
              <Box component="col" sx={{ width: "40%" }} />
              <Box component="col" sx={{ width: "20%" }} />
              <Box component="col" sx={{ width: "20%" }} />
            </Box>
            <Box component="tbody">
              <Box component="tr">
                <Box component="td" sx={cellSx}>Proxy Account</Box>
                <Box component="td" sx={cellSx}><input name="proxyAccount" value={values.proxyAccount} onChange={handleChange} style={inputStyle} /></Box>
                <Box component="td" sx={cellSx}>Last day date</Box>
                <Box component="td" sx={cellSx}><input name="lastDayDate" type="date" value={values.lastDayDate} onChange={handleChange} style={inputStyle} /></Box>
              </Box>
            </Box>
          </Box>

          {/* ── Guide Information ── */}
          <SectionHeading>Guide Information:</SectionHeading>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", border: BORDER, fontFamily: FONT, fontSize: "0.88rem", color: "#000" }}>
            <Box component="colgroup">
              <Box component="col" sx={{ width: "25%" }} />
              <Box component="col" sx={{ width: "25%" }} />
              <Box component="col" sx={{ width: "25%" }} />
              <Box component="col" sx={{ width: "25%" }} />
            </Box>
            <Box component="tbody">
              <Box component="tr">
                <Box component="td" sx={cellSx}>Guide Name</Box>
                <Box component="td" sx={cellSx}><input name="guideName" value={values.guideName} onChange={handleChange} style={inputStyle} /></Box>
                <Box component="td" sx={cellSx}>Designation</Box>
                <Box component="td" sx={cellSx}><input name="guideDesignation" value={values.guideDesignation} onChange={handleChange} style={inputStyle} /></Box>
              </Box>
              <Box component="tr">
                <Box component="td" sx={tallCellSx}>Department</Box>
                <Box component="td" colSpan={3} sx={tallCellSx}>
                  <textarea name="guideDepartment" value={values.guideDepartment} onChange={handleChange} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* ── Date / Place / Student Signature ── */}
          <Box sx={{ mt: 3, fontFamily: FONT, fontSize: "0.9rem", color: "#000" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", whiteSpace: "nowrap" }}>Date:</Typography>
              <input name="date" type="date" value={values.date} onChange={handleChange}
                style={{ ...inputStyle, width: 160, borderBottom: "1px solid #888" }} />
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", whiteSpace: "nowrap" }}>Place:</Typography>
                <input name="place" value={values.place} onChange={handleChange}
                  style={{ ...inputStyle, width: 180, borderBottom: "1px solid #888" }} />
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem", mb: 0.5 }}>Student Signature</Typography>
                <Box sx={{ borderBottom: "1px solid #888", width: 180 }} />
              </Box>
            </Box>
          </Box>

          {/* ── Approved / Guide Signature ── */}
          <Box sx={{ mt: 5, textAlign: "right", fontFamily: FONT, color: "#000" }}>
            <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem" }}>Approved</Typography>
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.9rem" }}>(Guide Signature)</Typography>
            </Box>
          </Box>

          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          {success && <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>}

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" disabled={saving}
              startIcon={saving && <CircularProgress size={20} />}>
              {saving ? "Submitting..." : "Submit Form"}
            </Button>
            {submissionId && (
              <Button variant="outlined" onClick={handleDownloadPdf} disabled={pdfLoading}
                startIcon={pdfLoading && <CircularProgress size={20} />}>
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