import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

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

  if (code === "gen-admin" || section === "genadmin" || section === "gen-admin") return "genAdmin";
  if (section.includes("fac") || code.includes("faculty")) return "fac";
  if (section.includes("student") || code.includes("student")) return "snp";
  if (
    section === "cc" ||
    section.includes("computer") ||
    code.includes("computer") ||
    code.startsWith("cc-")
  ) {
    return "cc";
  }
  if (section.includes("finance") || code.includes("finance")) return "fin";
  if (section.includes("establishment") || code.includes("establishment")) return "estb";
  if (section.includes("security") || code.includes("security")) return "security";

  // Keep uncategorized templates under HR until explicit metadata is added.
  return "hr";
};

const Forms = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const sectionBuckets = templates.reduce(
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
    const templatesInSection = sectionBuckets[sectionKey] || [];

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
      <Box sx={{ mt: 4, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" fontWeight={700}>
          Available Forms
        </Typography>
        <Button variant="text" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {renderSection(
        "genAdmin"
      )}

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