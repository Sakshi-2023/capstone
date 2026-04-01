import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  standardInputSx,
  standardInputProps,
  formContainerSx,
  formPaperSx,
  labelSx,
} from "../../utils/formStyles";

const TEMPLATE_SLUG = "/forms/general-administration-vehicle-requisition-transport/template";

const initialValues = {
  refNo: "",
  dated: "",
  indentorName: "",
  indentorDesignation: "",
  indentorDepartment: "",
  indentorDetails: "",
  vehicleTypeRequired: "",
  vehicleRequiredDate: "",
  vehicleRequiredPlace: "",
  vehicleRequiredTime: "",
  vehicleRequiredUpto: "",
  placesToBeVisited: "",
  guestNames: "",
  flightOrTrainNo: "",
  arrivalDepartureTime: "",
  isOfficial: "Yes",
  officialPurpose: "",
  signatureDate: "",
  allottedVehicleNo: "",
  allottedVehicleType: "",
  allottedDriver: "",
  driverReportTo: "",
  driverReportDate: "",
  driverReportPlace: "",
  driverReportTime: "",
};

const lineLabelSx = {
  fontSize: 15,
  lineHeight: 1.4,
};

const lineRowSx = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-end",
  gap: 1,
  mt: 1,
};

const VehicleRequisitionForTransportForm = () => {
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
      setValues((prev) => {
        const merged = { ...prev, ...prefill };

        // Backward compatibility for older submissions that only stored a single detail string.
        if (
          !merged.indentorName &&
          !merged.indentorDesignation &&
          !merged.indentorDepartment &&
          merged.indentorDetails
        ) {
          const [name = "", designation = "", ...departmentParts] = String(
            merged.indentorDetails
          )
            .split(",")
            .map((part) => part.trim());

          merged.indentorName = name;
          merged.indentorDesignation = designation;
          merged.indentorDepartment = departmentParts.join(", ");
        }

        return merged;
      });
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
    const required = [
      "indentorName",
      "indentorDesignation",
      "indentorDepartment",
      "vehicleTypeRequired",
      "vehicleRequiredDate",
      "vehicleRequiredPlace",
      "vehicleRequiredTime",
      "vehicleRequiredUpto",
      "placesToBeVisited",
      "isOfficial",
      "signatureDate",
    ];

    const hasRequired = required.every((k) => String(values[k] || "").trim() !== "");

    if (!hasRequired) {
      return false;
    }

    if (String(values.isOfficial || "").toLowerCase() === "yes") {
      return String(values.officialPurpose || "").trim() !== "";
    }

    return true;
  }, [values]);

  const handleChange = (name) => (event) => {
    setValues((prev) => ({ ...prev, [name]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const submitForm = async () => {
    if (!canSubmit) {
      setError("Please fill all required details before submitting.");
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

      const indentorDetails = [
        values.indentorName,
        values.indentorDesignation,
        values.indentorDepartment,
      ]
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .join(", ");

      const payload = {
        templateId,
        responses: {
          ...values,
          indentorDetails,
        },
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Vehicle Requisition - General Administration
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          Back to Forms
        </Button>
      </Box>

      <Paper sx={formPaperSx}>
        <Typography
          variant="h5"
          align="center"
          fontWeight={800}
          sx={{ letterSpacing: 0.3 }}
        >
          INDIAN INSTITUTE OF TECHNOLOGY PATNA
        </Typography>

        <Divider sx={{ borderBottomWidth: 2, borderColor: "#111", mt: 0.6, mb: 1 }} />

        <Box sx={{ ...lineRowSx, mt: 0.2, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, flexWrap: "wrap" }}>
            <Typography sx={lineLabelSx}>Ref. No.</Typography>
            <Typography sx={lineLabelSx}>:</Typography>
            <TextField
              value={values.refNo}
              onChange={handleChange("refNo")}
              sx={{ ...standardInputSx, minWidth: 130 }}
              {...standardInputProps}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, flexWrap: "wrap" }}>
            <Typography sx={lineLabelSx}>Dated</Typography>
            <Typography sx={lineLabelSx}>:</Typography>
            <TextField
              type="date"
              value={values.dated}
              onChange={handleChange("dated")}
              sx={{ ...standardInputSx, minWidth: 150 }}
              {...standardInputProps}
            />
          </Box>
        </Box>

        <Typography
          align="center"
          sx={{ textDecoration: "underline", fontWeight: 800, fontSize: 23 / 2, mt: 1, mb: 1.5 }}
        >
          INDENT FOR TRANSPORT
        </Typography>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>1. Name, Designation &amp; Dept./Section/Centre of the Indentor </Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.indentorName}
            onChange={handleChange("indentorName")}
            placeholder="name"
            sx={{ ...standardInputSx, minWidth: 160 }}
            {...standardInputProps}
          />
          <TextField
            value={values.indentorDesignation}
            onChange={handleChange("indentorDesignation")}
            placeholder="designation"
            sx={{ ...standardInputSx, minWidth: 160 }}
            {...standardInputProps}
          />
          <TextField
            value={values.indentorDepartment}
            onChange={handleChange("indentorDepartment")}
            placeholder="dept./section/centre"
            sx={{ ...standardInputSx, minWidth: 220, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        {/* <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>of the Indentor</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <Box sx={{ flex: 1, borderBottom: "1px solid #222", minHeight: 26 }} />
        </Box> */}

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>2. Type of vehicle required</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.vehicleTypeRequired}
            onChange={handleChange("vehicleTypeRequired")}
            sx={{ ...standardInputSx, minWidth: 260, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>3. Vehicle required</Typography>
          <Typography sx={lineLabelSx}>(a) on (date)</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            type="date"
            value={values.vehicleRequiredDate}
            onChange={handleChange("vehicleRequiredDate")}
            sx={{ ...standardInputSx, minWidth: 180, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>(b) at (place)</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.vehicleRequiredPlace}
            onChange={handleChange("vehicleRequiredPlace")}
            sx={{ ...standardInputSx, minWidth: 280, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>(c) at (time)</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.vehicleRequiredTime}
            onChange={handleChange("vehicleRequiredTime")}
            sx={{ ...standardInputSx, minWidth: 140 }}
            {...standardInputProps}
          />
          <Typography sx={lineLabelSx}>up to</Typography>
          <TextField
            value={values.vehicleRequiredUpto}
            onChange={handleChange("vehicleRequiredUpto")}
            sx={{ ...standardInputSx, minWidth: 140, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>4. Place(s) to be visited</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.placesToBeVisited}
            onChange={handleChange("placesToBeVisited")}
            sx={{ ...standardInputSx, minWidth: 280, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>5. For duty to receive guest</Typography>
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>(a) Name(s) of the guest(s) (if applicable)</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.guestNames}
            onChange={handleChange("guestNames")}
            sx={{ ...standardInputSx, minWidth: 250, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>(b) Flight No./Train No.</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.flightOrTrainNo}
            onChange={handleChange("flightOrTrainNo")}
            sx={{ ...standardInputSx, minWidth: 250, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>(c) Arrival / Departure time</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.arrivalDepartureTime}
            onChange={handleChange("arrivalDepartureTime")}
            sx={{ ...standardInputSx, minWidth: 250, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>6. Is it official (Yes / No)</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            select
            value={values.isOfficial}
            onChange={handleChange("isOfficial")}
            sx={{ ...standardInputSx, minWidth: 120 }}
            {...standardInputProps}
          >
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </TextField>
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>(If yes, please specify the purpose)</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.officialPurpose}
            onChange={handleChange("officialPurpose")}
            multiline
            rows={2}
            sx={{ ...standardInputSx, minWidth: 280, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ minWidth: 240 }}>
            <Box sx={{ borderBottom: "1px solid #222", height: 20, mb: 1 }} />
            <Typography sx={{ ...labelSx, fontSize: 14 }}>Signature of the HOD/HOS</Typography>
            <Box sx={{ ...lineRowSx, mt: 1 }}>
              <Typography sx={lineLabelSx}>Date</Typography>
              <Typography sx={lineLabelSx}>:</Typography>
              <TextField
                type="date"
                value={values.signatureDate}
                onChange={handleChange("signatureDate")}
                sx={{ ...standardInputSx, minWidth: 160 }}
                {...standardInputProps}
              />
            </Box>
          </Box>

          <Box sx={{ minWidth: 240 }}>
            <Box sx={{ borderBottom: "1px solid #222", height: 20, mb: 1 }} />
            <Typography sx={{ ...labelSx, fontSize: 14, textAlign: "right" }}>
              Signature of Indentor
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderBottomWidth: 2, borderColor: "#111", mt: 3, mb: 1.5 }} />

        <Typography align="center" sx={{ textDecoration: "underline", fontWeight: 700, mb: 1.8 }}>
          Vehicle Allotment Slip (for office use only)
        </Typography>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>Vehicle allotted</Typography>
          <Typography sx={lineLabelSx}>(a) Vehicle No.</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.allottedVehicleNo}
            onChange={handleChange("allottedVehicleNo")}
            sx={{ ...standardInputSx, minWidth: 220, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>(b) Type</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.allottedVehicleType}
            onChange={handleChange("allottedVehicleType")}
            sx={{ ...standardInputSx, minWidth: 220, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={lineRowSx}>
          <Typography sx={lineLabelSx}>(c) Driver</Typography>
          <Typography sx={lineLabelSx}>:</Typography>
          <TextField
            value={values.allottedDriver}
            onChange={handleChange("allottedDriver")}
            sx={{ ...standardInputSx, minWidth: 220, flex: 1 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: 14, lineHeight: 2.1 }}>
            The Driver is requested to report to Dr./Mr./Mrs.
            <TextField
              value={values.driverReportTo}
              onChange={handleChange("driverReportTo")}
              sx={{ ...standardInputSx, minWidth: 170, mx: 1 }}
              {...standardInputProps}
            />
            on (date)
            <TextField
              type="date"
              value={values.driverReportDate}
              onChange={handleChange("driverReportDate")}
              sx={{ ...standardInputSx, minWidth: 150, mx: 1 }}
              {...standardInputProps}
            />
            at (place)
            <TextField
              value={values.driverReportPlace}
              onChange={handleChange("driverReportPlace")}
              sx={{ ...standardInputSx, minWidth: 140, mx: 1 }}
              {...standardInputProps}
            />
            at (time)
            <TextField
              value={values.driverReportTime}
              onChange={handleChange("driverReportTime")}
              sx={{ ...standardInputSx, minWidth: 100, mx: 1 }}
              {...standardInputProps}
            />
            and report back to the undersigned / office after performing the duty.
          </Typography>
        </Box>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ minWidth: 180 }}>
            <Box sx={{ borderBottom: "1px solid #222", height: 18, mb: 1 }} />
            <Typography sx={{ ...labelSx, fontSize: 14, textAlign: "center" }}>
              Transport In-charge
            </Typography>
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

export default VehicleRequisitionForTransportForm;
