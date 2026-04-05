import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Button, TextField, InputBase, CircularProgress } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../services/api";

const FORM_CODE = "cc-email-account-request";

/* ── shared cell input ── */
const CellInput = ({ name, value, onChange, type = "text", multiline = false, rows = 1 }) => (
  <InputBase
    fullWidth
    type={type}
    value={value}
    onChange={(e) => onChange(name, e.target.value)}
    multiline={multiline}
    rows={rows}
    sx={{
      fontSize: 12,
      px: 0.6,
      py: 0.2,
      "& input": { p: 0 },
      "& textarea": { p: 0, resize: "none" },
    }}
  />
);

/* ── bordered cell wrapper ── */
const Cell = ({ children, sx = {}, label, labelSx = {} }) => (
  <Box
    sx={{
      border: "1px solid #333",
      px: 0.8,
      py: 0.4,
      minHeight: 28,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      ...sx,
    }}
  >
    {label && (
      <Typography sx={{ fontSize: 11, color: "#333", lineHeight: 1.3, ...labelSx }}>
        {label}
      </Typography>
    )}
    {children}
  </Box>
);

/* ── label cell (no border, just text) ── */
const LabelCell = ({ children, sx = {} }) => (
  <Box
    sx={{
      border: "1px solid #333",
      px: 0.8,
      py: 0.4,
      minHeight: 28,
      display: "flex",
      alignItems: "center",
      bgcolor: "#fff",
      ...sx,
    }}
  >
    <Typography sx={{ fontSize: 11, color: "#222", lineHeight: 1.4 }}>{children}</Typography>
  </Box>
);

const ComputerCenterEmailAccountRequestForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.prefill || {};
  const parentSubmissionId = location.state?.parentSubmissionId || null;

  const [values, setValues] = useState({
    userType: "",
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
    ...prefill,
  });

  const [templateId, setTemplateId] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch the real MongoDB _id for this form by matching its code
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/forms/templates");
        const found = (res.data || []).find((t) => t.code === FORM_CODE);
        if (found) {
          setTemplateId(found._id);
        } else {
          setError("Form template not found. Please contact the administrator.");
        }
      } catch {
        setError("Failed to load form template.");
      } finally {
        setLoadingTemplate(false);
      }
    };
    load();
  }, []);

  const set = (name, val) => setValues((p) => ({ ...p, [name]: val }));

  const handleSubmit = async () => {
    if (!templateId) {
      setError("Form template not loaded. Please refresh and try again.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const body = {
        templateId,           // real MongoDB ObjectId fetched from DB
        responses: { ...values },
      };
      if (parentSubmissionId) body.parentSubmissionId = parentSubmissionId;
      await API.post("/submissions", body);
      navigate("/submissions");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTemplate) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  /* ── tick checkbox ── */
  const Tick = ({ label, field, value }) => (
    <Box
      onClick={() => set(field, value)}
      sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", userSelect: "none" }}
    >
      <Box
        sx={{
          width: 12,
          height: 12,
          border: "1.5px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          flexShrink: 0,
          color: "#000",
        }}
      >
        {values[field] === value ? "✓" : ""}
      </Box>
      <Typography sx={{ fontSize: 12 }}>{label}</Typography>
    </Box>
  );

  /* ── domain checkbox ── */
  const DomainTick = ({ domain }) => (
    <Box
      onClick={() => set("emailDomain", domain)}
      sx={{ display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer", userSelect: "none" }}
    >
      <Box
        sx={{
          width: 11,
          height: 11,
          border: "1.5px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 8,
          flexShrink: 0,
        }}
      >
        {values.emailDomain === domain ? "✓" : ""}
      </Box>
      <Typography sx={{ fontSize: 11 }}>{domain}</Typography>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* top bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            component="img"
            src="/iitp.jpg"
            alt="IIT Patna"
            sx={{ width: 40, height: 40, objectFit: "contain" }}
          />
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>
            Computer Center Email Account Request
          </Typography>
        </Box>
        <Button variant="text" size="small" onClick={() => navigate("/forms")} sx={{ fontSize: 13 }}>
          Back to Forms
        </Button>
      </Box>

      {/* ── document body ── */}
      <Box
        sx={{
          border: "2px solid #222",
          p: { xs: 2, md: 3.5 },
          bgcolor: "#fff",
          boxShadow: "0 2px 14px rgba(0,0,0,0.10)",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 0.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.2 }}>
            Resource Allocation/Requisition Form
          </Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600, mt: 0.2 }}>
            Computer Center, IIT Patna
          </Typography>
        </Box>

        {/* dashed divider */}
        <Box
          sx={{
            borderBottom: "1.5px dashed #555",
            mb: 1.5,
            mt: 1,
          }}
        />

        {/* ── User Information row ── */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.8 }}>
          <Typography sx={{ fontSize: 13 }}>
            <strong>User Information: Faculty/Staff/Project Staff/Student</strong>{" "}
            (please tick)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Date:</Typography>
            <Box sx={{ borderBottom: "1.5px solid #333", minWidth: 120, ml: 0.5 }}>
              <InputBase
                type="date"
                value={values.date}
                onChange={(e) => set("date", e.target.value)}
                sx={{ fontSize: 12, "& input": { p: 0, pb: "1px" } }}
              />
            </Box>
          </Box>
        </Box>

        {/* ── User type tick boxes ── */}
        <Box sx={{ display: "flex", gap: 3, mb: 1.5 }}>
          {["Faculty", "Staff", "Project Staff", "Student"].map((t) => (
            <Tick key={t} label={t} field="userType" value={t} />
          ))}
        </Box>

        {/* ── Main info table ── */}
        <Box sx={{ border: "1px solid #333", mb: 2 }}>
          {/* Row 1: Emp ID | Name */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #333" }}>
            <LabelCell sx={{ borderRight: "1px solid #333", flexDirection: "column", alignItems: "flex-start" }}>
              <Typography sx={{ fontSize: 11 }}>Emp. ID/ Roll No.</Typography>
              <Typography sx={{ fontSize: 11 }}>/Project ID</Typography>
            </LabelCell>
            <Cell sx={{ borderRight: "1px solid #333" }}>
              <CellInput name="empIdRollNoProjectId" value={values.empIdRollNoProjectId} onChange={set} />
            </Cell>
            <LabelCell sx={{ borderRight: "1px solid #333", flexDirection: "column", alignItems: "flex-start" }}>
              <Typography sx={{ fontSize: 11 }}>Emp./Student</Typography>
              <Typography sx={{ fontSize: 11 }}>Name:</Typography>
            </LabelCell>
            <Cell>
              <CellInput name="name" value={values.name} onChange={set} />
            </Cell>
          </Box>

          {/* Row 2: Existing Email | Mobile */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #333" }}>
            <LabelCell sx={{ borderRight: "1px solid #333" }}>Existing Email:</LabelCell>
            <Cell sx={{ borderRight: "1px solid #333" }}>
              <CellInput name="existingEmail" value={values.existingEmail} onChange={set} />
            </Cell>
            <LabelCell sx={{ borderRight: "1px solid #333" }}>Mobile  No:</LabelCell>
            <Cell>
              <CellInput name="mobileNo" value={values.mobileNo} onChange={set} />
            </Cell>
          </Box>

          {/* Row 3: Department | Ph No */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #333" }}>
            <LabelCell sx={{ borderRight: "1px solid #333" }}>Department:</LabelCell>
            <Cell sx={{ borderRight: "1px solid #333" }}>
              <CellInput name="department" value={values.department} onChange={set} />
            </Cell>
            <LabelCell sx={{ borderRight: "1px solid #333" }}>Ph. No:</LabelCell>
            <Cell>
              <CellInput name="phNo" value={values.phNo} onChange={set} />
            </Cell>
          </Box>

          {/* Row 4: Block | Floor | Room No */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.5fr 1fr 1fr" }}>
            <LabelCell sx={{ borderRight: "1px solid #333" }}>Block:</LabelCell>
            <Cell sx={{ borderRight: "1px solid #333" }}>
              <CellInput name="block" value={values.block} onChange={set} />
            </Cell>
            <LabelCell sx={{ borderRight: "1px solid #333" }}>Floor:</LabelCell>
            <Cell sx={{ borderRight: "1px solid #333" }}>
              <CellInput name="floor" value={values.floor} onChange={set} />
            </Cell>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <LabelCell sx={{ borderRight: "1px solid #333" }}>Room No:</LabelCell>
              <Cell>
                <CellInput name="roomNo" value={values.roomNo} onChange={set} />
              </Cell>
            </Box>
          </Box>
        </Box>

        {/* ── Requirements section ── */}
        <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>
          Requirements of Email/Proxy Account:
        </Typography>

        <Box sx={{ border: "1px solid #333", mb: 2 }}>
          {/* Row 1: Preferred Email | domain ticks */}
          <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", borderBottom: "1px solid #333" }}>
            <LabelCell sx={{ borderRight: "1px solid #333", whiteSpace: "nowrap" }}>
              Preferred Email Id:
            </LabelCell>
            <Cell sx={{ borderRight: "1px solid #333" }}>
              <CellInput name="preferredEmailId" value={values.preferredEmailId} onChange={set} />
            </Cell>
            <LabelCell sx={{ borderRight: "1px solid #333", px: 1.5 }}>
              <DomainTick domain="@iitp.ac.in" />
            </LabelCell>
            <LabelCell sx={{ px: 1.5 }}>
              <DomainTick domain="@iitp.ac.in" />
            </LabelCell>
          </Box>

          {/* Row 2: Proxy | Days Limit */}
          <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr auto 1fr" }}>
            <LabelCell sx={{ borderRight: "1px solid #333", whiteSpace: "nowrap" }}>
              Proxy Account
            </LabelCell>
            <Cell sx={{ borderRight: "1px solid #333" }}>
              <CellInput name="proxyAccount" value={values.proxyAccount} onChange={set} />
            </Cell>
            <LabelCell sx={{ borderRight: "1px solid #333", flexDirection: "column", alignItems: "flex-start", px: 0.8 }}>
              <Typography sx={{ fontSize: 11 }}>Days Limit for</Typography>
              <Typography sx={{ fontSize: 11 }}>trainee/conference</Typography>
            </LabelCell>
            <Cell>
              <CellInput name="daysLimit" value={values.daysLimit} onChange={set} />
            </Cell>
          </Box>
        </Box>

        {/* Stock Exchange note */}
        <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>
          For requirements of Desktop/Laptop/Printer etc.
        </Typography>
        <Typography sx={{ fontSize: 12, mb: 2 }}>
          Please use the link{" "}
          <span style={{ color: "#1565c0" }}>http://172.16.1.34/StockExchange/</span>
        </Typography>

        {/* Signature of employee */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Box sx={{ borderBottom: "1.5px solid #333", minWidth: 240, textAlign: "right" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.3 }}>
              Signature of the Employee/Student
            </Typography>
            <InputBase
              value={values.signature}
              onChange={(e) => set("signature", e.target.value)}
              sx={{ fontSize: 12, width: "100%", "& input": { p: 0, textAlign: "right" } }}
            />
          </Box>
        </Box>

        {/* ── Forwarding Authority ── */}
        <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>
          Forwarding  Authority(Dean/Head/Incharge):
        </Typography>

        {/* Name | Designation | Signature row */}
        <Box sx={{ display: "flex", gap: 4, mb: 0.5 }}>
          <Box>
            <Typography sx={{ fontSize: 12 }}>Name:</Typography>
          </Box>
          <Box sx={{ flex: 1, borderBottom: "1.5px solid #333" }}>
            <InputBase
              fullWidth
              value={values.forwardingAuthorityName}
              onChange={(e) => set("forwardingAuthorityName", e.target.value)}
              sx={{ fontSize: 12, "& input": { p: 0 } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12 }}>Designation:</Typography>
          </Box>
          <Box sx={{ flex: 1, borderBottom: "1.5px solid #333" }}>
            <InputBase
              fullWidth
              value={values.forwardingAuthorityDesignation}
              onChange={(e) => set("forwardingAuthorityDesignation", e.target.value)}
              sx={{ fontSize: 12, "& input": { p: 0 } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12 }}>Signature:</Typography>
          </Box>
          <Box sx={{ flex: 1, borderBottom: "1.5px solid #333" }}>
            <InputBase
              fullWidth
              value={values.forwardingAuthoritySignature}
              onChange={(e) => set("forwardingAuthoritySignature", e.target.value)}
              sx={{ fontSize: 12, "& input": { p: 0 } }}
            />
          </Box>
        </Box>

        {/* long underline */}
        <Box sx={{ borderBottom: "1.5px solid #333", mb: 2, mt: 1.5 }} />

        {/* ── CC Office Use Only ── */}
        <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>
          For CC Office Use Only
        </Typography>

        <Box sx={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
          <Box>
            <Typography sx={{ fontSize: 12 }}>Issue Date:</Typography>
          </Box>
          <Box sx={{ borderBottom: "1.5px solid #333", minWidth: 110 }}>
            <InputBase
              type="date"
              value={values.issueDate}
              onChange={(e) => set("issueDate", e.target.value)}
              sx={{ fontSize: 12, "& input": { p: 0 } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12 }}>Issuer Name:</Typography>
          </Box>
          <Box sx={{ flex: 1, borderBottom: "1.5px solid #333" }}>
            <InputBase
              fullWidth
              value={values.issuerName}
              onChange={(e) => set("issuerName", e.target.value)}
              sx={{ fontSize: 12, "& input": { p: 0 } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12 }}>Issuer Signature:</Typography>
          </Box>
          <Box sx={{ flex: 1, borderBottom: "1.5px solid #333" }}>
            <InputBase
              fullWidth
              value={values.issuerSignature}
              onChange={(e) => set("issuerSignature", e.target.value)}
              sx={{ fontSize: 12, "& input": { p: 0 } }}
            />
          </Box>
        </Box>
      </Box>

      {/* error + submit */}
      {error && (
        <Typography color="error" sx={{ mt: 1.5, fontSize: 13 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 2.5, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 1,
            px: 4,
            py: 1,
            bgcolor: "#1565c0",
            "&:hover": { bgcolor: "#0d47a1" },
          }}
        >
          {submitting ? "Submitting…" : "Submit Form"}
        </Button>
      </Box>
    </Container>
  );
};

export default ComputerCenterEmailAccountRequestForm;