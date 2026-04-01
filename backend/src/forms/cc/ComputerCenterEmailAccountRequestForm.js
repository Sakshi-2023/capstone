const { getResponseValue, formatDate } = require("../../utils/pdfUtils");
const pdfStyles = require("../../utils/pdfStyles");

const renderComputerCenterEmailAccountRequestPdf = (doc, submission) => {
  const responses = submission.responses;

  const userType = String(getResponseValue(responses, "userType") || "").trim();
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
    .text("Resource Allocation/Requisition Form", { align: "center" });

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
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("User Information: Faculty/Staff/Project Staff/Student (please tick)");
  
  // Draw checkboxes for user type
  const checkboxY = doc.y;
  const checkboxSpacing = 80;
  const checkboxStartX = leftMargin + 20;
  
  ["Faculty", "Staff", "Project Staff", "Student"].forEach((type, index) => {
    const x = checkboxStartX + (index * checkboxSpacing);
    doc.rect(x, checkboxY, 10, 10).stroke();
    if (userType.toLowerCase().includes(type.toLowerCase().replace(" ", ""))) {
      doc.text("✓", x + 2, checkboxY + 8);
    }
    doc.font("Helvetica").fontSize(pdfStyles.getFontSize('BODY')).text(type, x + 15, checkboxY + 8);
  });

  doc.y = checkboxY + 25;

  underlineField("Date:", date, leftMargin, leftMargin + 200);
  underlineField("Emp. ID/Roll No./Project ID:", empIdRollNoProjectId, leftMargin, leftMargin + 300);
  underlineField("Name:", name, leftMargin, leftMargin + 300);
  underlineField("Existing Email:", existingEmail, leftMargin, leftMargin + 300);
  underlineField("Mobile No:", mobileNo, leftMargin, leftMargin + 200);
  underlineField("Department:", department, leftMargin, leftMargin + 300);
  underlineField("Ph. No:", phNo, leftMargin, leftMargin + 200);
  underlineField("Block:", block, leftMargin, leftMargin + 150);
  underlineField("Floor:", floor, leftMargin + 200, leftMargin + 350);
  underlineField("Room No:", roomNo, leftMargin, leftMargin + 150);

  doc.moveDown(0.5);

  // ── Requirements Section ───────────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("Requirements of Email/Proxy Account:");
  
  underlineField("Preferred Email Id:", preferredEmailId, leftMargin, leftMargin + 300);
  underlineField("Email Domain:", emailDomain, leftMargin, leftMargin + 200);
  underlineField("Proxy Account:", proxyAccount, leftMargin, leftMargin + 300);
  underlineField("Days Limit for trainee/conference:", daysLimit, leftMargin, leftMargin + 350);

  doc.moveDown(0.5);

  // ── Stock Exchange Note ────────────────────────────────────────────────────
  doc.font("Helvetica").fontSize(pdfStyles.getFontSize('BODY')).text(
    "For requirements of Desktop/Laptop/Printer etc. Please use the link http://172.16.1.34/StockExchange/",
    { align: "left" }
  );

  doc.moveDown(0.5);

  underlineField("Signature of the Employee/Student:", signature, leftMargin, leftMargin + 400);

  doc.moveDown(0.5);

  // ── Forwarding Authority Section ───────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("Forwarding Authority (Dean/Head/Incharge):");
  
  underlineField("Name:", forwardingAuthorityName, leftMargin, leftMargin + 300);
  underlineField("Designation:", forwardingAuthorityDesignation, leftMargin, leftMargin + 300);
  underlineField("Signature:", forwardingAuthoritySignature, leftMargin, leftMargin + 300);

  doc.moveDown(1);

  // ── CC Office Use Only Section ─────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("For CC Office Use Only");
  
  underlineField("Issue Date:", issueDate, leftMargin, leftMargin + 200);
  underlineField("Issuer Name:", issuerName, leftMargin + 250, leftMargin + 450);
  underlineField("Issuer Signature:", issuerSignature, leftMargin, leftMargin + 300);
};

module.exports = { renderComputerCenterEmailAccountRequestPdf };
