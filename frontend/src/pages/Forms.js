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

      {templates.map((tpl) => (
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
              onClick={() => navigate(`/forms/${tpl._id}/fill`)}
            >
              Fill Form
            </Button>
          </Box>
        </Paper>
      ))}
    </Container>
  );
};

export default Forms;

