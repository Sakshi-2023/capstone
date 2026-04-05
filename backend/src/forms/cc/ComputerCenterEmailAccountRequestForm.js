const { getResponseValue, formatDate } = require("../../utils/pdfUtils");

/**
 * Renders the Computer Center Email Account Request PDF.
 * Coordinates derived from exact pdfplumber extraction of the original PDF.
 * Page: A4 (595 x 842 pt).
 * PDFKit text() uses top-left origin (y increases downward) — same as pdfplumber.
 * So we use pdfplumber coordinates directly WITHOUT any y-inversion.
 */
const renderComputerCenterEmailAccountRequestPdf = (doc, submission) => {
  const responses = submission.responses;

  const userType = String(getResponseValue(responses, "userType") || "").trim().toLowerCase();
  const date = formatDate(getResponseValue(responses, "date"));
  const empIdRollNoProjectId = String(getResponseValue(responses, "empIdRollNoProjectId") || "").trim();
  const name = String(getResponseValue(responses, "name") || "").trim();
  const existingEmail = String(getResponseValue(responses, "existingEmail") || "").trim();
  const mobileNo = String(getResponseValue(responses, "mobileNo") || "").trim();
  const department = String(getResponseValue(responses, "department") || "").trim();
  const phNo = String(getResponseValue(responses, "phNo") || "").trim();
  const block = String(getResponseValue(responses, "block") || "").trim();
  const floor = String(getResponseValue(responses, "floor") || "").trim();
  const roomNo = String(getResponseValue(responses, "roomNo") || "").trim();
  const preferredEmailId = String(getResponseValue(responses, "preferredEmailId") || "").trim();
  const emailDomain = String(getResponseValue(responses, "emailDomain") || "").trim();
  const proxyAccount = String(getResponseValue(responses, "proxyAccount") || "").trim();
  const daysLimit = String(getResponseValue(responses, "daysLimit") || "").trim();
  const signature = String(getResponseValue(responses, "signature") || "").trim();
  const forwardingAuthorityName = String(getResponseValue(responses, "forwardingAuthorityName") || "").trim();
  const forwardingAuthorityDesignation = String(getResponseValue(responses, "forwardingAuthorityDesignation") || "").trim();
  const forwardingAuthoritySignature = String(getResponseValue(responses, "forwardingAuthoritySignature") || "").trim();
  const issueDate = formatDate(getResponseValue(responses, "issueDate"));
  const issuerName = String(getResponseValue(responses, "issuerName") || "").trim();
  const issuerSignature = String(getResponseValue(responses, "issuerSignature") || "").trim();

  // ─── Helpers ────────────────────────────────────────────────────────────────
  // PDFKit text() uses top-left origin — y increases downward, same as pdfplumber.
  // Use pdfplumber coordinates directly (NO py() conversion needed).

  const drawText = (text, x, y, fontSize, font) => {
    doc.fontSize(fontSize).font(font).text(text, x, y, { lineBreak: false });
  };

  // Horizontal line at pdfplumber y (top-left origin)
  const hLine = (x0, x1, y, lineWidth = 0.73) => {
    doc.moveTo(x0, y).lineTo(x1, y).lineWidth(lineWidth).stroke();
  };

  // Vertical line at pdfplumber x, from y0 to y1
  const vLine = (x, y0, y1, lineWidth = 0.5) => {
    doc.moveTo(x, y0).lineTo(x, y1).lineWidth(lineWidth).stroke();
  };

  // ─── TITLE ──────────────────────────────────────────────────────────────────
  drawText("Resource Allocation/Requisition Form", 164.6, 45.6, 14.5, "Helvetica-Bold");
  drawText("Computer Center, IIT Patna", 257.8, 68.2, 10.8, "Helvetica");
  hLine(55.4, 549.2, 88.8, 0.73);

  // ─── USER INFORMATION HEADER ─────────────────────────────────────────────
  drawText("User Information: Faculty/Staff/Project Staff/Student (please tick)", 55.4, 102.2, 10, "Helvetica-Bold");

  drawText("Date:", 440.9, 103.0, 10, "Helvetica-Bold");
  drawText("_____________", 463, 103.0, 10, "Helvetica");
  if (date) {
    drawText(date, 477, 99, 10, "Helvetica");
  }

  // ─── USER TYPE CHECKBOXES ────────────────────────────────────────────────
  const checkboxTypes = ["Faculty", "Staff", "Project Staff", "Student"];
  const checkboxSpacing = [55.4, 158, 261, 364];
  checkboxTypes.forEach((type, i) => {
    const cx = checkboxSpacing[i];
    const cy = 120;
    doc.rect(cx, cy - 5, 8, 8).lineWidth(0.5).stroke();
    const normalized = userType.replace(/\s/g, "").toLowerCase();
    const typeNorm = type.replace(/\s/g, "").toLowerCase();
    if (normalized.includes(typeNorm)) {
      drawText("/", cx + 1, cy - 4, 8, "Helvetica");
    }
    drawText(type, cx + 11, cy - 4, 9, "Helvetica");
  });

  // ─── MAIN TABLE ───────────────────────────────────────────────────────────
  const tRows = [151.1, 185, 209, 237, 265];
  const tCols = [50.0, 145.0, 262.2, 352.0, 545.8];

  tRows.forEach(rowY => hLine(50.0, 546.2, rowY, 0.5));
  tCols.forEach(colX => vLine(colX, 151.1, 263.4, 0.5));

  // Extra vertical dividers for Block/Floor/Room row only
  vLine(306.1, 235.2, 263.4, 0.5);
  vLine(448.6, 235.2, 263.4, 0.5);

  // ─── TABLE CELL LABELS ───────────────────────────────────────────────────
  // Row 0 (151.1–179.2)
  drawText("Emp. ID/", 55.4, 153.5, 9.5, "Helvetica-Bold");
  drawText("Roll No.", 55.4, 164.5, 9.5, "Helvetica-Bold");
  drawText("/Project ID", 55.4, 175.5, 9.5, "Helvetica-Bold");
  drawText("Emp./Student", 267.7, 157, 9.5, "Helvetica-Bold");
  drawText("Name:", 267.7, 170.5, 9.5, "Helvetica-Bold");

  // Row 1 (179.2–207.2)
  drawText("Existing Email:", 55.4, 192, 9.5, "Helvetica-Bold");
  drawText("Mobile No:", 267.7, 192, 9.5, "Helvetica-Bold");

  // Row 2 (207.2–235.2)
  drawText("Department:", 55.4, 216.2, 9.5, "Helvetica-Bold");
  drawText("Ph. No:", 267.7, 216.2, 9.5, "Helvetica-Bold");

  // Row 3 (235.2–263.4)
  drawText("Block:", 55.4, 244.2, 9.5, "Helvetica-Bold");
  drawText("Floor:", 267.7, 244.2, 9.5, "Helvetica-Bold");
  drawText("Room No:", 357.4, 244.2, 9.5, "Helvetica-Bold");

  // ─── TABLE CELL VALUES ───────────────────────────────────────────────────
  if (empIdRollNoProjectId) drawText(empIdRollNoProjectId, 155, 165, 9, "Helvetica");
  if (name) drawText(name, 360, 165, 9, "Helvetica");
  if (existingEmail) drawText(existingEmail, 155, 191, 9, "Helvetica");
  if (mobileNo) drawText(mobileNo, 360, 192, 9, "Helvetica");
  if (department) drawText(department, 155, 222, 9, "Helvetica");
  if (phNo) drawText(phNo, 360, 222, 9, "Helvetica");
  if (block) drawText(block, 155, 247, 9, "Helvetica");
  if (floor) drawText(floor, 316, 247, 9, "Helvetica");
  if (roomNo) drawText(roomNo, 461, 247, 9, "Helvetica");

  // ─── REQUIREMENTS HEADER ─────────────────────────────────────────────────
  drawText("Requirements of Email/Proxy Account:", 55.4, 280.8, 10, "Helvetica-Bold");

  // ─── REQUIREMENTS TABLE ──────────────────────────────────────────────────
  const reqRows = [304.6, 330.8, 371.0];
  const reqCols = [50.0, 145.0, 262.2, 357.1, 492.7, 555.2];

  reqRows.forEach(rowY => hLine(50.0, 555.7, rowY, 0.5));
  reqCols.forEach(colX => vLine(colX, 304.6, 371.0, 0.5));

  // Labels
  drawText("Preferred Email Id:", 55.4, 316.9, 9.5, "Helvetica-Bold");
  drawText("@iitp.ac.in", 269.7, 316.9, 9.5, "Helvetica-Bold");
  drawText("@iitp.ac.in", 502, 316.9, 9.5, "Helvetica-Bold");

  drawText("Proxy Account", 55.4, 340.2, 9.5, "Helvetica-Bold");
  drawText("Days Limit for", 267.7, 332.4, 9.5, "Helvetica-Bold");
  drawText("trainee/conference", 267.7, 347.7, 9.5, "Helvetica-Bold");

  // Values
  if (preferredEmailId) drawText(preferredEmailId, 151, 315, 9, "Helvetica");
  if (proxyAccount) drawText(proxyAccount, 152, 348, 9, "Helvetica");
  if (daysLimit) drawText(daysLimit, 368, 341, 9, "Helvetica");

  // ─── STOCK NOTE ──────────────────────────────────────────────────────────
  drawText("For requirements of Desktop/Laptop/Printer etc.", 55.4, 398.3, 9, "Helvetica");
  drawText("Please use the link http://172.16.1.34/StockExchange/", 55.4, 410.2, 9, "Helvetica");

  // ─── SIGNATURE LINE ──────────────────────────────────────────────────────
  drawText("Signature of the Employee/Student", 390, 455, 9.5, "Helvetica-Bold");
  hLine(51.8, 568.0, 473.0, 0.73);
  if (signature) drawText(signature, 485, 440, 9, "Helvetica");

  // ─── FORWARDING AUTHORITY ────────────────────────────────────────────────
  drawText("Forwarding Authority(Dean/Head/Incharge):", 55.4, 488.6, 10, "Helvetica-Bold");

  drawText("Name:", 55.4, 510, 9.5, "Helvetica-Bold");
  drawText("Designation:", 220, 510, 9.5, "Helvetica-Bold");
  drawText("Signature:", 420, 510, 9.5, "Helvetica-Bold");

  if (forwardingAuthorityName) drawText(forwardingAuthorityName, 90, 510, 9, "Helvetica");
  if (forwardingAuthorityDesignation) drawText(forwardingAuthorityDesignation, 290, 510, 9, "Helvetica");
  if (forwardingAuthoritySignature) drawText(forwardingAuthoritySignature, 468, 510, 9, "Helvetica");

  hLine(55.4, 562.0, 525, 0.5);

  // ─── CC OFFICE USE ONLY ──────────────────────────────────────────────────
  drawText("For CC Office Use Only", 55.4, 545, 10, "Helvetica-Bold");

  drawText("Issue Date:", 55.4, 580, 9.5, "Helvetica-Bold");
  drawText("Issuer Name:", 200, 580, 9.5, "Helvetica-Bold");
  drawText("Issuer Signature:", 400, 580, 9.5, "Helvetica-Bold");

  if (issueDate) drawText(issueDate, 110, 580, 9, "Helvetica");
  if (issuerName) drawText(issuerName, 270, 580, 9, "Helvetica");
  if (issuerSignature) drawText(issuerSignature, 490, 580, 9, "Helvetica");
};

module.exports = { renderComputerCenterEmailAccountRequestPdf };