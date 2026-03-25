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

const statusColor = (status) => {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "draft":
      return "default";
    default:
      return "warning";
  }
};

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/submissions/me");
        setSubmissions(res.data || []);
      } catch {
        setError("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownload = async (id) => {
    try {
      const res = await API.get(`/submissions/${id}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `submission-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch {
      alert("Failed to download PDF");
    }
  };

  const handleEditAsNew = async (submission) => {
    const prefill = {};
    if (submission.responses) {
      // responses is stored as a Map-like object
      Object.entries(submission.responses).forEach(([k, v]) => {
        prefill[k] = v;
      });
    }

    // Route to hardcoded form page if template has a code, otherwise use dynamic form filler
    const targetPath = submission.template?.code
      ? `/forms/${submission.template.code}`
      : `/forms/${submission.template._id}/fill`;

    navigate(targetPath, {
      state: {
        prefill,
        parentSubmissionId: submission._id,
      },
    });
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
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          My Submissions
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

      {submissions.map((s) => (
        <Paper key={s._id} sx={{ p: 2, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1">
                {s.template?.title || "Untitled Form"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Submitted at: {new Date(s.createdAt).toLocaleString()}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                <Chip
                  size="small"
                  label={s.status}
                  color={statusColor(s.status)}
                />
                {typeof s.version === "number" && s.version > 1 && (
                  <Chip
                    size="small"
                    label={`Version ${s.version}`}
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleDownload(s._id)}
              >
                PDF
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleEditAsNew(s)}
              >
                Edit as New
              </Button>
            </Stack>
          </Box>
        </Paper>
      ))}
    </Container>
  );
};

export default Submissions;

