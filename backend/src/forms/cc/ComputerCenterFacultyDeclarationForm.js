const { getResponseValue, formatDate } = require("../../utils/pdfUtils");

/**
 * Renders the IIT Patna Website Faculty Declaration Form PDF.
 * Coordinates extracted via pdfplumber from the original PDF.
 * Page: A4 (595 x 842 pt). PDFKit text() uses top-left origin — y increases downward.
 * All coordinates are pdfplumber "top" values and are used directly (no inversion).
 */
const renderComputerCenterFacultyDeclarationPdf = (doc, submission) => {
  const responses = submission.responses;

  const facultyName = String(getResponseValue(responses, "facultyName") || "").trim();
  const employeeNo = String(getResponseValue(responses, "employeeNo") || "").trim();
  const designation = String(getResponseValue(responses, "designation") || "").trim();
  const department = String(getResponseValue(responses, "department") || "").trim();
  const facultySignature = String(getResponseValue(responses, "facultySignature") || "").trim();
  const date = formatDate(getResponseValue(responses, "date"));

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const drawText = (text, x, y, fontSize, font, options = {}) => {
    doc.fontSize(fontSize).font(font).text(text, x, y, { lineBreak: false, ...options });
  };

  const hLine = (x0, x1, y, lineWidth = 0.5) => {
    doc.moveTo(x0, y).lineTo(x1, y).lineWidth(lineWidth).stroke();
  };

  const rect = (x0, y0, x1, y1, lineWidth = 0.5) => {
    doc.rect(x0, y0, x1 - x0, y1 - y0).lineWidth(lineWidth).stroke();
  };

  // ─── TITLE ──────────────────────────────────────────────────────────────────
  // Centered bold title at top=71.2
  doc.fontSize(14).font("Helvetica-Bold")
    .text("IIT Patna Website Faculty Declaration Form", 56.8, 71.2, {
      align: "center",
      width: 595 - 56.8 * 2,
      lineBreak: false,
    });

  // ─── INTRO LINE ─────────────────────────────────────────────────────────────
  // top=114.8
  drawText("On being given full access to my personal web page, I hereby declare that:", 56.8, 114.8, 11, "Helvetica");

  // ─── NUMBERED POINTS ────────────────────────────────────────────────────────
  // Point 1: top=134.6, wrap at top=148.4
  drawText("1.", 74.8, 134.6, 11, "Helvetica");
  drawText("I will take full responsibility of maintaining it. I will not disclose the web page username", 92.3, 134.6, 11, "Helvetica");
  drawText("and password to anyone.", 92.8, 148.4, 11, "Helvetica");

  // Point 2: top=168.2, wrap at top=182.0
  drawText("2.", 74.8, 168.2, 11, "Helvetica");
  drawText("I will not post any negative or untoward remarks against any fellow faculty member/staff or", 92.3, 168.2, 11, "Helvetica");
  drawText("against the administration of the Institute on the web page.", 92.8, 182.0, 11, "Helvetica");

  // Point 3: top=201.8
  drawText("3.", 74.8, 201.8, 11, "Helvetica");
  drawText("I will not post any political content on the web page.", 92.3, 201.8, 11, "Helvetica");

  // ─── PENALTY CLAUSE ─────────────────────────────────────────────────────────
  // top=241.4, wrap at 255.2
  drawText("In case of violation of any of the above, I understand that I will be subjected to penal action", 56.8, 241.4, 11, "Helvetica");
  drawText("by the Institute.", 56.8, 255.2, 11, "Helvetica");

  // ─── FIELD TABLE ────────────────────────────────────────────────────────────
  // Two rows of two-column boxes from pdfplumber rects (converted):
  // Row 1: top=292.9  bottom=312.7  (Faculty Name | Employee No)
  // Row 2: top=312.7  bottom=332.4  (Designation  | Department)
  // Column split at x=292.3, left edge=51.3, right edge=533.2

  const r1top = 292.9, r1bot = 312.7;
  const r2top = 312.7, r2bot = 332.4;
  const colMid = 292.3, colLeft = 51.3, colRight = 533.2;

  // Draw the four box borders
  rect(colLeft, r1top, colMid, r1bot);
  rect(colMid, r1top, colRight, r1bot);
  rect(colLeft, r2top, colMid, r2bot);
  rect(colMid, r2top, colRight, r2bot);

  // Row 1 labels & values — vertically centered in each cell (cell height ~20)
  const r1textY = r1top + 4;
  drawText("Faculty Name:", colLeft + 5, r1textY, 11, "Helvetica-Bold");
  if (facultyName) drawText(facultyName, colLeft + 90, r1textY, 11, "Helvetica");

  drawText("Employee No:", colMid + 5, r1textY, 11, "Helvetica-Bold");
  if (employeeNo) drawText(employeeNo, colMid + 85, r1textY, 11, "Helvetica");

  // Row 2 labels & values
  const r2textY = r2top + 4;
  drawText("Designation:", colLeft + 5, r2textY, 11, "Helvetica-Bold");
  if (designation) drawText(designation, colLeft + 85, r2textY, 11, "Helvetica");

  drawText("Department:", colMid + 5, r2textY, 11, "Helvetica-Bold");
  if (department) drawText(department, colMid + 82, r2textY, 11, "Helvetica");

  // ─── FACULTY SIGNATURE ──────────────────────────────────────────────────────
  // Label at top=354.0, underline just below
  drawText("Faculty Signature:", 56.8, 354.0, 11, "Helvetica-Bold");
  hLine(56.8, 533.2, 368.0, 0.5);
  if (facultySignature) drawText(facultySignature, 170, 354.0, 11, "Helvetica");

  // ─── DATE ───────────────────────────────────────────────────────────────────
  // Label at top=373.7, underline just below
  drawText("Date:", 56.8, 373.7, 11, "Helvetica-Bold");
  hLine(56.8, 533.2, 387.7, 0.5);
  if (date) drawText(date, 94, 373.7, 11, "Helvetica");

  // ─── NOTE ───────────────────────────────────────────────────────────────────
  // top=413.2, wraps to 427.0
  doc.fontSize(11).font("Helvetica-Bold")
    .text("Note", 56.8, 413.2, { continued: true, lineBreak: false });
  doc.font("Helvetica")
    .text(": Please submit two copies of this form. One will be with the website team and the other in", { lineBreak: false });
  drawText("your personal file.", 56.8, 427.0, 11, "Helvetica");
};

module.exports = { renderComputerCenterFacultyDeclarationPdf };