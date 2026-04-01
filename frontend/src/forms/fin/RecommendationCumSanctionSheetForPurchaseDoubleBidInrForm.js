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
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  formContainerSx,
  formPaperSx,
  standardInputProps,
  standardInputSx,
  tableFieldSx,
} from "../../utils/formStyles";

const TEMPLATE_SLUG = "/forms/finance-procurement-recommendation-sanction-double-bid-inr/template";

const DEFAULT_ITEM_COUNT = 2;

const createEmptyItem = () => ({
  description: "",
  rate: "",
  quantity: "",
  amount: "",
});

const createDefaultItems = (count = DEFAULT_ITEM_COUNT) =>
  Array.from({ length: count }, () => createEmptyItem());

const hasItemContent = (item) => {
  if (!item) return false;
  return ["description", "rate", "quantity", "amount"].some(
    (key) => String(item[key] || "").trim() !== ""
  );
};

const sanitizeIncomingItem = (item = {}) => ({
  description: String(item.description || ""),
  rate: String(item.rate || ""),
  quantity: String(item.quantity || ""),
  amount: String(item.amount || ""),
});

const normalizePrefillValues = (prefill = {}) => {
  const normalized = {
    ...initialValues,
    items: createDefaultItems(),
  };

  Object.keys(initialValues).forEach((key) => {
    if (key === "items") return;
    if (prefill[key] !== undefined && prefill[key] !== null) {
      normalized[key] = prefill[key];
    }
  });

  const incomingItems = Array.isArray(prefill.items)
    ? prefill.items.map((item) => sanitizeIncomingItem(item)).filter(hasItemContent)
    : [];

  const legacyItems = [1, 2, 3, 4, 5]
    .map((index) =>
      sanitizeIncomingItem({
        description: prefill[`item${index}Description`],
        rate: prefill[`item${index}Rate`],
        quantity: prefill[`item${index}Quantity`],
        amount: prefill[`item${index}Amount`],
      })
    )
    .filter(hasItemContent);

  const mergedItems = incomingItems.length > 0 ? incomingItems : legacyItems;

  normalized.items =
    mergedItems.length >= DEFAULT_ITEM_COUNT
      ? mergedItems
      : [...mergedItems, ...createDefaultItems(DEFAULT_ITEM_COUNT - mergedItems.length)];

  return normalized;
};

const initialValues = {
  purchaseOf: "",
  sheetDate: "",
  niqTenderNo: "",
  niqTenderDate: "",
  vendorsRespondedCount: "",
  priceBidsOpenedOn: "",
  purchaseCommitteeMembers: "",
  fileNo: "",
  yearOfSanction: "",
  department: "",
  category: "",
  vendorName: "",
  vendorAddressLine1: "",
  vendorAddressLine2: "",
  items: createDefaultItems(),

  gstPercentage: "",
  gstAmount: "",
  additionalCharge1Label: "",
  additionalCharge1Amount: "",
  additionalCharge2Label: "",
  additionalCharge2Amount: "",
  totalAmount: "",

  member1: "",
  member2: "",
  member3: "",
  member4: "",
};

const lineLabelSx = {
  fontSize: 14,
  lineHeight: 1.4,
};

const lineRowSx = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-end",
  gap: 1,
  mt: 1,
};

const tableHeaderCellSx = {
  borderRight: "1px solid #222",
  borderBottom: "1px solid #222",
  p: 0.6,
  fontWeight: 700,
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const tableBodyCellSx = {
  borderRight: "1px solid #222",
  borderBottom: "1px solid #222",
  p: 0.35,
  minHeight: 35,
  display: "flex",
  alignItems: "center",
};

const FinanceProcurementRecommendationSanctionForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const items = Array.isArray(values?.items) ? values.items : createDefaultItems();

  React.useEffect(() => {
    const prefill = location.state?.prefill;
    if (prefill && typeof prefill === "object") {
      setValues(normalizePrefillValues(prefill));
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
      "purchaseOf",
      "sheetDate",
      "niqTenderNo",
      "niqTenderDate",
      "vendorsRespondedCount",
      "department",
      "vendorName",
    ];

    return required.every((key) => String(values[key] || "").trim() !== "");
  }, [values]);

  const handleChange = (name) => (event) => {
    setValues((prev) => ({ ...prev, [name]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const handleItemChange = (index, key) => (event) => {
    const nextValue = event.target.value;
    setValues((prev) => {
      const safeItems = Array.isArray(prev?.items) ? prev.items : createDefaultItems();
      const nextItems = [...safeItems];
      nextItems[index] = {
        ...nextItems[index],
        [key]: nextValue,
      };
      return { ...prev, items: nextItems };
    });
    setError("");
    setSuccess("");
  };

  const addItemRow = () => {
    setValues((prev) => ({
      ...prev,
      items: [...(Array.isArray(prev?.items) ? prev.items : createDefaultItems()), createEmptyItem()],
    }));
  };

  const removeItemRow = (indexToRemove) => {
    setValues((prev) => {
      const safeItems = Array.isArray(prev?.items) ? prev.items : createDefaultItems();
      if (safeItems.length <= DEFAULT_ITEM_COUNT) {
        return prev;
      }

      return {
        ...prev,
        items: safeItems.filter((_, index) => index !== indexToRemove),
      };
    });
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

  const renderItemRow = (item, index) => {
    const serial = `${index + 1}`;

    return (
      <React.Fragment key={`item-row-${index}`}>
        <Box sx={{ ...tableBodyCellSx, justifyContent: "space-between", fontSize: 12 }}>
          <Box sx={{ pl: 0.6 }}>{serial}.</Box>
          <Button
            size="small"
            color="error"
            variant="text"
            onClick={() => removeItemRow(index)}
            disabled={items.length <= DEFAULT_ITEM_COUNT}
            sx={{ minWidth: 36, px: 0.5, fontSize: 11, lineHeight: 1.1 }}
          >
            Del
          </Button>
        </Box>
        <Box sx={tableBodyCellSx}>
          <TextField
            variant="outlined"
            value={item.description}
            onChange={handleItemChange(index, "description")}
            sx={tableFieldSx}
            fullWidth
          />
        </Box>
        <Box sx={tableBodyCellSx}>
          <TextField
            variant="outlined"
            value={item.rate}
            onChange={handleItemChange(index, "rate")}
            sx={tableFieldSx}
            fullWidth
          />
        </Box>
        <Box sx={tableBodyCellSx}>
          <TextField
            variant="outlined"
            value={item.quantity}
            onChange={handleItemChange(index, "quantity")}
            sx={tableFieldSx}
            fullWidth
          />
        </Box>
        <Box sx={{ ...tableBodyCellSx, borderRight: "none" }}>
          <TextField
            variant="outlined"
            value={item.amount}
            onChange={handleItemChange(index, "amount")}
            sx={tableFieldSx}
            fullWidth
          />
        </Box>
      </React.Fragment>
    );
  };

  return (
    <Container maxWidth="lg" sx={formContainerSx}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Typography variant="h5" fontWeight={700}>
          Finance Procurement Recommendation Cum Sanction Sheet
        </Typography>
        <Button variant="text" onClick={() => navigate("/forms")}>
          Back to Forms
        </Button>
      </Box>

      <Paper sx={formPaperSx}>
        <Typography align="center" fontWeight={700} sx={{ fontSize: 27 / 2 }}>
          Format for procurement in INR using Double Bid Tendering process
        </Typography>

        <Box sx={{ mt: 1.1, mb: 1.3, textAlign: "center" }}>
          <Typography sx={{ textDecoration: "underline", fontSize: 34 / 2 }}>
            Recommendation cum Sanction Sheet for the purchase of -
          </Typography>
          <TextField
            value={values.purchaseOf}
            onChange={handleChange("purchaseOf")}
            sx={{ ...standardInputSx, minWidth: 280, mt: 0.5 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={{ ...lineRowSx, justifyContent: "flex-end", mt: 0 }}>
          <Typography sx={lineLabelSx}>Date:</Typography>
          <TextField
            type="date"
            value={values.sheetDate}
            onChange={handleChange("sheetDate")}
            sx={{ ...standardInputSx, minWidth: 160 }}
            {...standardInputProps}
          />
        </Box>

        <Box sx={{ mt: 1.2 }}>
          <Typography sx={{ fontSize: 14, lineHeight: 1.75 }}>
            Quotations for the supply of
            <TextField
              value={values.purchaseOf}
              onChange={handleChange("purchaseOf")}
              sx={{ ...standardInputSx, minWidth: 220, mx: 1 }}
              {...standardInputProps}
            />
            were invited through NIQ/Tender No.
            <TextField
              value={values.niqTenderNo}
              onChange={handleChange("niqTenderNo")}
              sx={{ ...standardInputSx, minWidth: 180, mx: 1 }}
              {...standardInputProps}
            />
            , dated
            <TextField
              type="date"
              value={values.niqTenderDate}
              onChange={handleChange("niqTenderDate")}
              sx={{ ...standardInputSx, minWidth: 165, mx: 1 }}
              {...standardInputProps}
            />
            . Responses were received from
            <TextField
              type="number"
              value={values.vendorsRespondedCount}
              onChange={handleChange("vendorsRespondedCount")}
              sx={{ ...standardInputSx, minWidth: 80, mx: 1 }}
              {...standardInputProps}
            />
            vendors as given in the quotation opening report.
          </Typography>

          <Typography sx={{ fontSize: 14, lineHeight: 1.75, mt: 1.1 }}>
            The price bids of technically satisfied firms were opened on
            <TextField
              type="date"
              value={values.priceBidsOpenedOn}
              onChange={handleChange("priceBidsOpenedOn")}
              sx={{ ...standardInputSx, minWidth: 165, mx: 1 }}
              {...standardInputProps}
            />
            in the presence of purchase committee members
            <TextField
              value={values.purchaseCommitteeMembers}
              onChange={handleChange("purchaseCommitteeMembers")}
              sx={{ ...standardInputSx, minWidth: 280, mx: 1 }}
              {...standardInputProps}
            />
            , after the approval of the Director, IIT Patna.
          </Typography>
        </Box>

        <Box sx={{ mt: 1.2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
          <Box sx={lineRowSx}>
            <Typography sx={lineLabelSx}>File No.</Typography>
            <Typography sx={lineLabelSx}>:</Typography>
            <TextField value={values.fileNo} onChange={handleChange("fileNo")} sx={{ ...standardInputSx, minWidth: 220, flex: 1 }} {...standardInputProps} />
          </Box>
          <Box sx={lineRowSx}>
            <Typography sx={lineLabelSx}>Year of Sanction</Typography>
            <Typography sx={lineLabelSx}>:</Typography>
            <TextField value={values.yearOfSanction} onChange={handleChange("yearOfSanction")} sx={{ ...standardInputSx, minWidth: 220, flex: 1 }} {...standardInputProps} />
          </Box>
          <Box sx={lineRowSx}>
            <Typography sx={lineLabelSx}>Department</Typography>
            <Typography sx={lineLabelSx}>:</Typography>
            <TextField value={values.department} onChange={handleChange("department")} sx={{ ...standardInputSx, minWidth: 220, flex: 1 }} {...standardInputProps} />
          </Box>
          <Box sx={lineRowSx}>
            <Typography sx={lineLabelSx}>Category</Typography>
            <Typography sx={lineLabelSx}>:</Typography>
            <TextField value={values.category} onChange={handleChange("category")} sx={{ ...standardInputSx, minWidth: 220, flex: 1 }} {...standardInputProps} />
          </Box>
          <Box sx={{ ...lineRowSx, gridColumn: { xs: "1", md: "1 / span 2" } }}>
            <Typography sx={lineLabelSx}>Vendor</Typography>
            <Typography sx={lineLabelSx}>:</Typography>
            <TextField value={values.vendorName} onChange={handleChange("vendorName")} placeholder="M/s ..." sx={{ ...standardInputSx, minWidth: 240 }} {...standardInputProps} />
            <TextField value={values.vendorAddressLine1} onChange={handleChange("vendorAddressLine1")} placeholder="Address line 1" sx={{ ...standardInputSx, minWidth: 220, flex: 1 }} {...standardInputProps} />
            <TextField value={values.vendorAddressLine2} onChange={handleChange("vendorAddressLine2")} placeholder="Address line 2" sx={{ ...standardInputSx, minWidth: 220, flex: 1 }} {...standardInputProps} />
          </Box>
        </Box>

        <Divider sx={{ mt: 2.1, mb: 1.5 }} />

        <Box sx={{ border: "1px solid #222" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "70px 1.8fr 0.7fr 0.7fr 0.8fr" }}>
            <Box sx={tableHeaderCellSx}>Sl. No.</Box>
            <Box sx={tableHeaderCellSx}>Item description (with product code, if any)</Box>
            <Box sx={tableHeaderCellSx}>Rate</Box>
            <Box sx={tableHeaderCellSx}>Quantity</Box>
            <Box sx={{ ...tableHeaderCellSx, borderRight: "none" }}>Amount</Box>

            {items.map((item, index) => renderItemRow(item, index))}

            <Box sx={{ ...tableBodyCellSx, borderBottom: "1px solid #222" }} />
            <Box sx={{ ...tableBodyCellSx, justifyContent: "flex-end", fontSize: 12 }}>GST @</Box>
            <Box sx={{ ...tableBodyCellSx }}>
              <TextField
                variant="outlined"
                value={values.gstPercentage}
                onChange={handleChange("gstPercentage")}
                sx={tableFieldSx}
                fullWidth
              />
            </Box>
            <Box sx={{ ...tableBodyCellSx, justifyContent: "center", fontSize: 12 }}>%</Box>
            <Box sx={{ ...tableBodyCellSx, borderRight: "none" }}>
              <TextField
                variant="outlined"
                value={values.gstAmount}
                onChange={handleChange("gstAmount")}
                sx={tableFieldSx}
                fullWidth
              />
            </Box>

            <Box sx={tableBodyCellSx} />
            <Box sx={tableBodyCellSx}>
              <TextField
                variant="outlined"
                value={values.additionalCharge1Label}
                onChange={handleChange("additionalCharge1Label")}
                placeholder="Additional charge 1"
                sx={tableFieldSx}
                fullWidth
              />
            </Box>
            <Box sx={tableBodyCellSx} />
            <Box sx={tableBodyCellSx} />
            <Box sx={{ ...tableBodyCellSx, borderRight: "none" }}>
              <TextField
                variant="outlined"
                value={values.additionalCharge1Amount}
                onChange={handleChange("additionalCharge1Amount")}
                sx={tableFieldSx}
                fullWidth
              />
            </Box>

            <Box sx={tableBodyCellSx} />
            <Box sx={tableBodyCellSx}>
              <TextField
                variant="outlined"
                value={values.additionalCharge2Label}
                onChange={handleChange("additionalCharge2Label")}
                placeholder="Additional charge 2"
                sx={tableFieldSx}
                fullWidth
              />
            </Box>
            <Box sx={tableBodyCellSx} />
            <Box sx={tableBodyCellSx} />
            <Box sx={{ ...tableBodyCellSx, borderRight: "none" }}>
              <TextField
                variant="outlined"
                value={values.additionalCharge2Amount}
                onChange={handleChange("additionalCharge2Amount")}
                sx={tableFieldSx}
                fullWidth
              />
            </Box>

            <Box sx={{ ...tableBodyCellSx, borderBottom: "none" }} />
            <Box sx={{ ...tableBodyCellSx, borderBottom: "none", justifyContent: "flex-end", fontWeight: 700, fontSize: 12 }}>
              Total Amount
            </Box>
            <Box sx={{ ...tableBodyCellSx, borderBottom: "none" }} />
            <Box sx={{ ...tableBodyCellSx, borderBottom: "none" }} />
            <Box sx={{ ...tableBodyCellSx, borderBottom: "none", borderRight: "none" }}>
              <TextField
                variant="outlined"
                value={values.totalAmount}
                onChange={handleChange("totalAmount")}
                sx={tableFieldSx}
                fullWidth
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 1.2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="outlined" size="small" onClick={addItemRow}>
            Add Item
          </Button>
        </Box>

        <Typography sx={{ textAlign: "center", mt: 2.2, fontSize: 14 }}>
          Amount as per details given in the above table may be sanctioned.
        </Typography>

        <Box sx={{ mt: 4, display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
          <TextField label="Member 1" variant="standard" value={values.member1} onChange={handleChange("member1")} />
          <TextField label="Member 2" variant="standard" value={values.member2} onChange={handleChange("member2")} />
          <TextField label="Member 3" variant="standard" value={values.member3} onChange={handleChange("member3")} />
          <TextField label="Member 4" variant="standard" value={values.member4} onChange={handleChange("member4")} />
        </Box>

        <Box sx={{ mt: 2.4, display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ minWidth: 220 }}>
            <Box sx={{ borderBottom: "1px solid #222", height: 18, mb: 0.8 }} />
            <Typography sx={{ textAlign: "center", fontSize: 14 }}>(HoD)</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2.4, display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ minWidth: 220 }}>
            <Box sx={{ borderBottom: "1px solid #222", height: 18, mb: 0.8 }} />
            <Typography sx={{ textAlign: "center", fontSize: 14 }}>Registrar</Typography>
          </Box>

          <Box sx={{ minWidth: 220 }}>
            <Box sx={{ borderBottom: "1px solid #222", height: 18, mb: 0.8 }} />
            <Typography sx={{ textAlign: "center", fontSize: 14, fontWeight: 700 }}>Director</Typography>
            <Typography sx={{ textAlign: "center", fontSize: 14, fontWeight: 700 }}>IIT Patna</Typography>
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

export default FinanceProcurementRecommendationSanctionForm;
