import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Stack,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const FALLBACK_TEMPLATES = [
  {
    _id: "fallback-security_requisition_for_vehicle_sticker",
    code: "security_requisition_for_vehicle_sticker",
    title: "Requisition for Vehicle Sticker",
    description: "Security requisition form for issue of vehicle sticker.",
    section: "security",
    approvalStages: [],
  },
  {
    _id: "fallback-security-vehicle-sticker-requition-for-married-scholar",
    code: "security-vehicle-sticker-requition-for-married-scholar",
    title: "Requisition for Vehicle Sticker (Resident of Married Accommodation Only)",
    description: "Security requisition form for issue of vehicle sticker for married accommodation residents.",
    section: "security",
    approvalStages: [],
  },
];

const SECTION_TITLES = {
  genAdmin: "General Administration",
  fac: "Faculty Affairs",
  snp: "Student Affairs",
  cc: "Computer Center",
  fin:"Finance",
  estb: "Establishment",
  security:"Security",
  hr: "Human Resources",
};

const resolveSection = (template) => {
  const code = String(template?.code || "").toLowerCase();
  const section = String(template?.section || template?.category || "").toLowerCase();

  if (
    code === "gen-admin" ||
    code.startsWith("gen-admin-") ||
    section === "genadmin" ||
    section === "gen-admin"
  ) {
    return "genAdmin";
  }
  if (
    section === "cc" ||
    section.includes("computer") ||
    code.includes("computer") ||
    code.startsWith("cc-")
  ) {
    return "cc";
  }

  if (section.includes("finance") || code.includes("finance")) return "fin";
if (section.includes("estb") || code.includes("estb") || section.includes("establishment")) return "estb";  if (section.includes("security") || code.includes("security")) return "security";

  if (section.includes("student") || code.includes("student")) return "snp";
  if (section === "fin" || section.includes("finance") || code.includes("finance")) return "fin";

  if (section.includes("security") || code.includes("security")) return "security";


  // Keep uncategorized templates under HR until explicit metadata is added.
  return "hr";
};

const Forms = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/forms/templates");
        setTemplates(res.data || []);
      } catch (err) {
        setError("Failed to load forms");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const templatesWithFallback = useMemo(() => {
    const existingCodes = new Set(
      (templates || [])
        .map((tpl) => String(tpl?.code || "").toLowerCase())
        .filter(Boolean)
    );

    const missingFallbacks = FALLBACK_TEMPLATES.filter(
      (tpl) => !existingCodes.has(String(tpl.code || "").toLowerCase())
    );

    return [...templates, ...missingFallbacks];
  }, [templates]);

  const sectionBuckets = templatesWithFallback.reduce(
    (acc, tpl) => {
      const key = resolveSection(tpl);
      acc[key].push(tpl);
      return acc;
    },
    {
      genAdmin: [],
      fac: [],
      snp: [],
      cc: [],
      fin:[],
      estb: [],
      security:[],
      hr: [],
    }
  );

  const renderTemplateCard = (tpl) => (
    <Paper key={tpl._id} sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6">{tpl.title}</Typography>
          {tpl.description && (
            <Typography variant="body2" color="text.secondary">
              {tpl.description}
            </Typography>
          )}
          {Array.isArray(tpl.approvalStages) && tpl.approvalStages.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              <Typography variant="caption" color="text.secondary">
                Approval chain:
              </Typography>
              {tpl.approvalStages.map((r, idx) => (
                <Chip key={idx} label={r} size="small" />
              ))}
            </Stack>
          )}
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            const targetPath = tpl.code
              ? `/forms/${tpl.code}`
              : `/forms/${tpl._id}/fill`;
            navigate(targetPath);
          }}
        >
          Fill Form
        </Button>
      </Box>
    </Paper>
  );

  const renderSection = (sectionKey, customContent = null) => {
    const search = searchQuery.trim().toLowerCase();
    const templatesInSection = (sectionBuckets[sectionKey] || []).filter((tpl) => {
      if (!search) return true;
      const title = String(tpl.title || "").toLowerCase();
      const description = String(tpl.description || "").toLowerCase();
      const code = String(tpl.code || "").toLowerCase();
      return (
        title.includes(search) ||
        description.includes(search) ||
        code.includes(search)
      );
    });

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.2 }}>
          {SECTION_TITLES[sectionKey]}
        </Typography>

        {customContent}

        {templatesInSection.length > 0 ? (
          templatesInSection.map((tpl) => renderTemplateCard(tpl))
        ) : !customContent ? (
          <Paper sx={{ p: 2, mb: 2, border: "1px dashed #d0d4da", bgcolor: "#fafbfc" }}>
            <Typography variant="body2" color="text.secondary">
              No forms available in this section right now.
            </Typography>
          </Paper>
        ) : null}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 4,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Available Forms
        </Typography>

        <Box sx={{ width: { xs: "100%", md: 360 }, ml: { md: "auto" } }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search forms by title, description, or code"
            size="small"
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button variant="text" onClick={() => navigate("/dashboard")}>
              ← Dashboard
            </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {renderSection("genAdmin")}
      {renderSection("fac")}
      {renderSection("snp")}
      {renderSection("cc")}
      {renderSection("fin")}
      {renderSection("estb")}
      {renderSection("security")}

    </Container>
  );
};

export default Forms;