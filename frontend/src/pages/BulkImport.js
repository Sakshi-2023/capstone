import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Alert,
  Chip,
  CircularProgress,
  Divider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const BulkImport = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const eventSourceRef = useRef(null);
  const fileInputRef = useRef(null);

  // Change Role form state
  const [roleEmail, setRoleEmail] = useState("");
  const [roleValue, setRoleValue] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleResult, setRoleResult] = useState(null); // { severity, message }

  const ALLOWED_ROLES = ["Faculty", "HOD", "Dean", "Director", "Admin"];

  const handleChangeRole = async (e) => {
    e.preventDefault();
    setRoleResult(null);

    if (!roleEmail.trim()) {
      setRoleResult({ severity: "error", message: "Email is required." });
      return;
    }
    if (!roleValue) {
      setRoleResult({ severity: "error", message: "Please select a new role." });
      return;
    }

    setRoleLoading(true);
    try {
      const res = await API.patch("/admin/change-role", {
        email: roleEmail.trim(),
        role: roleValue
      });
      setRoleResult({ severity: "success", message: res.data.message });
      setRoleEmail("");
      setRoleValue("");
    } catch (err) {
      setRoleResult({
        severity: "error",
        message: err.response?.data?.message || "Failed to update role. Please try again."
      });
    } finally {
      setRoleLoading(false);
    }
  };

  // Verify the current user is an Admin
  useEffect(() => {
    API.get("/auth/me")
      .then((res) => {
        if (res.data.role !== "Admin") {
          setAccessDenied(true);
        } else {
          setUser(res.data);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [navigate]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setUploadError("");
    setResults([]);
    setSummary(null);
    setProgress({ processed: 0, total: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError("Please select a CSV file.");
      return;
    }

    // Close any existing SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setUploading(true);
    setUploadError("");
    setResults([]);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await API.post("/admin/bulk-import", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const { jobId, total } = res.data;
      setProgress({ processed: 0, total });
      setUploading(false);
      setStreaming(true);

      // Open SSE stream – token passed as query param because EventSource
      // does not support custom request headers.
      const token = localStorage.getItem("token");
      const baseURL =
        process.env.REACT_APP_API_URL || "http://localhost:5100/api";
      const url = `${baseURL}/admin/bulk-import/${jobId}/stream?token=${encodeURIComponent(
        token
      )}`;

      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "row") {
          setResults((prev) => [...prev, data]);
          setProgress({ processed: data.row, total: data.total });
        } else if (data.type === "complete") {
          setSummary({
            created: data.created,
            failed: data.failed,
            total: data.total
          });
          setStreaming(false);
          es.close();
        }
      };

      es.onerror = () => {
        setUploadError(
          "Connection to the server was lost. Results below may be partial."
        );
        setStreaming(false);
        es.close();
      };
    } catch (err) {
      setUploading(false);
      setUploadError(
        err.response?.data?.message || "Failed to upload file. Please try again."
      );
    }
  };

  const percent =
    progress.total > 0
      ? Math.min(100, Math.round((progress.processed / progress.total) * 100))
      : 0;

  const isRunning = uploading || streaming;

  if (accessDenied) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Alert severity="error">
            Access denied. This page is restricted to administrators.
          </Alert>
          <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Bulk User Import
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Upload a CSV file with columns:{" "}
            <code>name, email, password, role</code>. Role defaults to{" "}
            <em>Faculty</em> if omitted. Allowed roles: Faculty, HOD, Dean,
            Director, Admin.
          </Typography>
        </Box>
        <Button variant="text" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </Button>
      </Box>

      {/* Upload card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
        >
          <Button
            variant="outlined"
            component="label"
            disabled={isRunning}
          >
            Choose CSV
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={handleFileChange}
            />
          </Button>

          {file && (
            <Typography variant="body2" color="text.secondary">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={!file || isRunning}
            startIcon={
              uploading ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            {uploading ? "Uploading…" : streaming ? "Processing…" : "Import Users"}
          </Button>
        </Box>

        {uploadError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {uploadError}
          </Alert>
        )}

        {/* Progress bar */}
        {(streaming || summary) && (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.75
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {progress.processed} / {progress.total} rows processed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {percent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{ height: 10, borderRadius: 5 }}
              color={
                summary
                  ? summary.failed === 0
                    ? "success"
                    : summary.created === 0
                    ? "error"
                    : "warning"
                  : "primary"
              }
            />
          </Box>
        )}

        {/* Summary alert after completion */}
        {summary && (
          <>
            <Divider sx={{ my: 2 }} />
            <Alert
              severity={
                summary.failed === 0
                  ? "success"
                  : summary.created === 0
                  ? "error"
                  : "warning"
              }
            >
              Import complete —{" "}
              <strong>{summary.created}</strong> account
              {summary.created !== 1 ? "s" : ""} created,{" "}
              <strong>{summary.failed}</strong> failed out of{" "}
              <strong>{summary.total}</strong> rows.
            </Alert>
          </>
        )}
      </Paper>

      {/* Change Role section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Change Role
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Update the role of an existing user by their email address.
        </Typography>
        <Box
          component="form"
          onSubmit={handleChangeRole}
          sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}
        >
          <TextField
            label="User Email"
            type="email"
            value={roleEmail}
            onChange={(e) => setRoleEmail(e.target.value)}
            sx={{ minWidth: 260 }}
            disabled={roleLoading}
            autoComplete="off"
          />
          <FormControl sx={{ minWidth: 180 }} disabled={roleLoading}>
            <InputLabel>New Role</InputLabel>
            <Select
              label="New Role"
              value={roleValue}
              onChange={(e) => setRoleValue(e.target.value)}
            >
              {ALLOWED_ROLES.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            disabled={roleLoading}
            startIcon={roleLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {roleLoading ? "Updating…" : "Confirm"}
          </Button>
        </Box>
        {roleResult && (
          <Alert severity={roleResult.severity} sx={{ mt: 2 }}>
            {roleResult.message}
          </Alert>
        )}
      </Paper>

      {/* Per-row results table */}
      {results.length > 0 && (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell width={60}>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell width={110}>Status</TableCell>
                <TableCell>Failure Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((r) => (
                <TableRow
                  key={r.row}
                  sx={{
                    bgcolor:
                      r.status === "failed"
                        ? "rgba(244,67,54,0.06)"
                        : "inherit"
                  }}
                >
                  <TableCell>{r.row}</TableCell>
                  <TableCell>{r.name || <em style={{ color: "#aaa" }}>—</em>}</TableCell>
                  <TableCell>{r.email || <em style={{ color: "#aaa" }}>—</em>}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.status === "success" ? "Created" : "Failed"}
                      color={r.status === "success" ? "success" : "error"}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    {r.reason ? (
                      <Typography variant="body2" color="error">
                        {r.reason}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
};

export default BulkImport;
