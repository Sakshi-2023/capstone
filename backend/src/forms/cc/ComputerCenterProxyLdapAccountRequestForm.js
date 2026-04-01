const { getResponseValue, formatDate } = require("../../utils/pdfUtils");
const pdfStyles = require("../../utils/pdfStyles");

const renderComputerCenterProxyLdapAccountRequestPdf = (doc, submission) => {
  const responses = submission.responses;

  const studentName = String(getResponseValue(responses, "studentName") || "").trim();
  const studentRollNo = String(getResponseValue(responses, "studentRollNo") || "").trim();
  const instituteName = String(getResponseValue(responses, "instituteName") || "").trim();
  const email = String(getResponseValue(responses, "email") || "").trim();
  const mobileNo = String(getResponseValue(responses, "mobileNo") || "").trim();
  const department = String(getResponseValue(responses, "department") || "").trim();
  const phNo = String(getResponseValue(responses, "phNo") || "").trim();
  const address = String(getResponseValue(responses, "address") || "").trim();
  const proxyAccount = String(getResponseValue(responses, "proxyAccount") || "").trim();
  const lastDayDate = formatDate(getResponseValue(responses, "lastDayDate"));
  const guideName = String(getResponseValue(responses, "guideName") || "").trim();
  const guideDesignation = String(getResponseValue(responses, "guideDesignation") || "").trim();
  const guideDepartment = String(getResponseValue(responses, "guideDepartment") || "").trim();
  const date = formatDate(getResponseValue(responses, "date"));
  const place = String(getResponseValue(responses, "place") || "").trim();
  const studentSignature = String(getResponseValue(responses, "studentSignature") || "").trim();
  const guideSignature = String(getResponseValue(responses, "guideSignature") || "").trim();

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
    .text("Requisition Form for Trainee", { align: "center" });

  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize('SUBTITLE'))
    .text("Computer Center, IIT Patna", { align: "center" });

  doc.moveDown(0.5);

  // ── Header Line ────────────────────────────────────────────────────────────
  doc.moveTo(leftMargin, doc.y)
     .lineTo(leftMargin + pageWidth, doc.y)
     .lineWidth(1)
     .stroke();

  doc.moveDown(0.3);

  // ── User Information Section ─────────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("User Information:");
  
  underlineField("Student Name:", studentName, leftMargin, leftMargin + 400);
  underlineField("Student Roll No:", studentRollNo, leftMargin, leftMargin + 400);
  underlineField("Institute/Organization/College Name:", instituteName, leftMargin, leftMargin + 450);
  underlineField("Email:", email, leftMargin, leftMargin + 400);
  underlineField("Mobile No:", mobileNo, leftMargin, leftMargin + 400);
  underlineField("Department:", department, leftMargin, leftMargin + 400);
  underlineField("Ph. No:", phNo, leftMargin, leftMargin + 400);

  // Address field with more space
  const addressY = doc.y;
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("Address:", leftMargin, addressY);
  doc.moveTo(leftMargin + 60, addressY + 14)
     .lineTo(leftMargin + 500, addressY + 14)
     .lineWidth(0.5)
     .stroke();
  if (address) {
    doc.font("Helvetica").fontSize(pdfStyles.getFontSize('BODY')).text(address, leftMargin + 63, addressY, {
      width: 437,
      ellipsis: true,
    });
  }
  doc.y = addressY + 40;

  doc.moveDown(0.5);

  // ── Proxy Account Requirements Section ─────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("Requirements of Proxy Account:");
  
  underlineField("Proxy Account:", proxyAccount, leftMargin, leftMargin + 400);
  underlineField("Last day date:", lastDayDate, leftMargin, leftMargin + 400);

  doc.moveDown(0.5);

  // ── Guide Information Section ───────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("Guide Information:");
  
  underlineField("Guide Name:", guideName, leftMargin, leftMargin + 400);
  underlineField("Designation:", guideDesignation, leftMargin, leftMargin + 400);
  underlineField("Department:", guideDepartment, leftMargin, leftMargin + 400);

  doc.moveDown(0.5);

  underlineField("Date:", date, leftMargin, leftMargin + 200);
  underlineField("Place:", place, leftMargin + 250, leftMargin + 450);

  doc.moveDown(0.5);

  underlineField("Student Signature:", studentSignature, leftMargin, leftMargin + 400);

  doc.moveDown(1);

  // ── Approval Section ───────────────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("Approved", { align: "center" });
  
  underlineField("(Guide Signature):", guideSignature, leftMargin + 150, leftMargin + 450);
};

module.exports = { renderComputerCenterProxyLdapAccountRequestPdf };
