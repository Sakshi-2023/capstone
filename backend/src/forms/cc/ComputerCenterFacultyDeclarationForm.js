const { getResponseValue, formatDate } = require("../../utils/pdfUtils");
const pdfStyles = require("../../utils/pdfStyles");

const renderComputerCenterFacultyDeclarationPdf = (doc, submission) => {
  const responses = submission.responses;

  const facultyName = String(getResponseValue(responses, "facultyName") || "").trim();
  const employeeNo = String(getResponseValue(responses, "employeeNo") || "").trim();
  const designation = String(getResponseValue(responses, "designation") || "").trim();
  const department = String(getResponseValue(responses, "department") || "").trim();
  const facultySignature = String(getResponseValue(responses, "facultySignature") || "").trim();
  const date = formatDate(getResponseValue(responses, "date"));

  const leftMargin = doc.page.margins.left;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const underlineField = (label, value, lineStartX, lineEndX) => {
    const rowY = doc.y;
    const lineY = rowY + 14;

    doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text(label, lineStartX, rowY);
    doc
      .moveTo(lineStartX + label.length * 7, lineY)
      .lineTo(lineEndX, lineY)
      .lineWidth(0.5)
      .stroke();

    if (value) {
      doc.font("Helvetica").fontSize(pdfStyles.getFontSize('BODY')).text(value, lineStartX + label.length * 7 + 3, rowY, {
        width: lineEndX - lineStartX - label.length * 7 - 6,
        ellipsis: true,
      });
    }

    doc.y = rowY + 24;
  };

  // ── Header ──────────────────────────────────────────────────────────────────
  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize('TITLE'))
    .text("IIT Patna Website Faculty Declaration Form", { align: "center" });
  
  doc.moveDown(0.5);

  // ── Declaration Text ────────────────────────────────────────────────────────
  doc.font("Helvetica").fontSize(pdfStyles.getFontSize('BODY'));
  
  doc.text("On being given full access to my personal web page, I hereby declare that:");
  doc.moveDown(0.5);
  
  doc.text("1. I will take full responsibility of maintaining it. I will not disclose the web page username and password to anyone.");
  doc.moveDown(0.5);
  
  doc.text("2. I will not post any negative or untoward remarks against any fellow faculty member/staff or against the administration of the Institute on the web page.");
  doc.moveDown(0.5);
  
  doc.text("3. I will not post any political content on the web page.");
  doc.moveDown(0.5);
  
  doc.text("In case of violation of any of the above, I understand that I will be subjected to penal action by the Institute.");
  doc.moveDown(1.5);

  // ── Form Fields in Two Column Layout ───────────────────────────────────────────
  const fieldWidth = pageWidth / 2 - 20;
  
  // First row: Faculty Name and Employee No
  const firstRowY = doc.y;
  underlineField("Faculty Name:", facultyName, leftMargin, leftMargin + fieldWidth);
  doc.y = firstRowY;
  underlineField("Employee No:", employeeNo, leftMargin + pageWidth / 2, leftMargin + pageWidth - 20);
  
  // Second row: Designation and Department
  const secondRowY = doc.y;
  underlineField("Designation:", designation, leftMargin, leftMargin + fieldWidth);
  doc.y = secondRowY;
  underlineField("Department:", department, leftMargin + pageWidth / 2, leftMargin + pageWidth - 20);
  
  // Third row: Faculty Signature and Date
  const thirdRowY = doc.y;
  underlineField("Faculty Signature:", facultySignature, leftMargin, leftMargin + fieldWidth);
  doc.y = thirdRowY;
  underlineField("Date:", date, leftMargin + pageWidth / 2, leftMargin + pageWidth - 20);
  
  doc.moveDown(2);
  
  // ── Note ──────────────────────────────────────────────────────────────────────
  doc.font("Helvetica-Oblique").fontSize(pdfStyles.getFontSize('BODY')).text(
    "Note: Please submit two copies of this form. One will be with the website team and the other in your personal file.",
    { align: "center" }
  );
};

module.exports = { renderComputerCenterFacultyDeclarationPdf };
