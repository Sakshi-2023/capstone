import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Approvals = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [action, setAction] = useState("approved");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/submissions/pending/list");
      setItems(res.data || []);
    } catch {
      setError("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDialog = (id, nextAction) => {
    setActiveId(id);
    setAction(nextAction);
    setComment("");
    setDialogOpen(true);
  };

  const handleClose = () => {
    if (saving) return;
    setDialogOpen(false);
    setActiveId(null);
  };

  const handleSubmit = async () => {
    if (!activeId) return;
    setSaving(true);
    try {
      await API.post(`/submissions/${activeId}/act`, {
        action,
        comment,
      });
      setDialogOpen(false);
      setActiveId(null);
      await load();
    } catch {
      alert("Failed to update submission");
    } finally {
      setSaving(false);
    }
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
          Pending Approvals
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

      {items.map((s) => (
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
                Submitted by: {s.submittedBy?.name} ({s.submittedBy?.email})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Submitted at: {new Date(s.createdAt).toLocaleString()}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip size="small" label={s.status} color="warning" />
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => openDialog(s._id, "rejected")}
                color="error"
              >
                Reject
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => openDialog(s._id, "approved")}
                color="primary"
              >
                Approve
              </Button>
            </Stack>
          </Box>
        </Paper>
      ))}

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {action === "approved" ? "Approve Submission" : "Reject Submission"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You are about to{" "}
            <strong>{action === "approved" ? "approve" : "reject"}</strong>{" "}
            this form. You may optionally leave a comment for the applicant.
          </Typography>
          <TextField
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={action === "approved" ? "primary" : "error"}
            disabled={saving}
          >
            {saving
              ? "Saving…"
              : action === "approved"
              ? "Approve"
              : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Approvals;

