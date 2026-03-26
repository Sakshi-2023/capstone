const { getResponseValue, formatDate } = require("../../utils/pdfUtils");

const renderComputerCenterRequestingLdapAccountPdf = (doc, submission) => {
  const responses = submission.responses;

  const empIdProjectId = String(getResponseValue(responses, "empIdProjectId") || "").trim();
  const fullName = String(getResponseValue(responses, "fullName") || "").trim();
  const department = String(getResponseValue(responses, "department") || "").trim();
  const phoneMobileNo = String(getResponseValue(responses, "phoneMobileNo") || "").trim();
  const personalEmailId = String(getResponseValue(responses, "personalEmailId") || "").trim();
  const address = String(getResponseValue(responses, "address") || "").trim();
  const iitpEmailId = String(getResponseValue(responses, "iitpEmailId") || "").trim();
  const validityLastDate = formatDate(getResponseValue(responses, "validityLastDate"));
  const requestDate = formatDate(getResponseValue(responses, "requestDate"));

  const leftMargin = doc.page.margins.left;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const underlineField = (label, value, lineStartX, lineEndX) => {
    const rowY = doc.y;
    const lineY = rowY + 14;

    doc.font("Helvetica").fontSize(12).text(label, leftMargin, rowY);
    doc
      .moveTo(lineStartX, lineY)
      .lineTo(lineEndX, lineY)
      .lineWidth(0.5)
      .stroke();

    if (value) {
      doc.font("Helvetica").fontSize(12).text(value, lineStartX + 3, rowY, {
        width: lineEndX - lineStartX - 6,
        ellipsis: true,
      });
    }

    doc.y = rowY + 24;
  };

  // ── Header ──────────────────────────────────────────────────────────────────
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("INDIAN INSTITUTE OF TECHNOLOGY PATNA", { align: "center" });

  doc.moveDown(0.15);

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("COMPUTER CENTREE", { align: "center" });

  doc.moveDown(0.2);

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("REQUEST / REQUISITION FORM", { align: "center" });

  doc
    .font("Helvetica")
    .fontSize(12)
    .text("(For LDAP Account)", { align: "center" });

  doc.moveDown(0.9);

  // ── Section A ───────────────────────────────────────────────────────────────
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("A. Personal Information (PLEASE FILL IN BLOCK LETTERS)");

  doc.moveDown(0.5);

  const lineLeft = leftMargin + pageWidth * 0.35;
  const lineRight = leftMargin + pageWidth;

  underlineField("1. Emp. ID/Project ID", empIdProjectId, lineLeft, lineRight);
  underlineField("2. Full Name", fullName, lineLeft, lineRight);
  underlineField("3. Dept./Section/Centre", department, lineLeft, lineRight);
  underlineField("4. Phone/Mobile No.:", phoneMobileNo, lineLeft, lineRight);
  underlineField("5. Personal Email-ID", personalEmailId, lineLeft, lineRight);
  underlineField("6. Address:", address, lineLeft, lineRight);

  // ── Section B ───────────────────────────────────────────────────────────────
  doc.moveDown(0.2);
  underlineField("B. IITP Email id (If any):", iitpEmailId, leftMargin + pageWidth * 0.33, lineRight);

  // ── Section C ───────────────────────────────────────────────────────────────
  doc.moveDown(0.2);
  doc
    .font("Helvetica")
    .fontSize(12)
    .text("C. Validity date / Last Date for", leftMargin, doc.y);
  doc
    .font("Helvetica")
    .fontSize(12)
    .text("LDAP account", leftMargin, doc.y);

  const cValueY = doc.y + 3;
  const cLineY = cValueY + 15;
  doc
    .moveTo(leftMargin, cLineY)
    .lineTo(leftMargin + pageWidth * 0.55, cLineY)
    .lineWidth(0.5)
    .stroke();
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(validityLastDate || "", leftMargin + 3, cValueY);

  doc.y = cLineY + 18;
  doc.moveDown(0.8);

  // ── Signature blocks ────────────────────────────────────────────────────────
  const sigLineWidth = 210;
  const rightX = doc.page.width - doc.page.margins.right - sigLineWidth;

  doc
    .moveTo(leftMargin, doc.y + 12)
    .lineTo(leftMargin + sigLineWidth, doc.y + 12)
    .lineWidth(0.5)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("SIGNATURE", leftMargin, doc.y + 16);

  const dateTextY = doc.y + 6;
  doc.font("Helvetica").fontSize(12).text("Date:", leftMargin, dateTextY);

  const dateUnderlineY = dateTextY + 13;
  const dateStartX = leftMargin + doc.widthOfString("Date: ") + 2;
  doc
    .moveTo(dateStartX, dateUnderlineY)
    .lineTo(leftMargin + sigLineWidth, dateUnderlineY)
    .lineWidth(0.5)
    .stroke();
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(requestDate || "", dateStartX + 2, dateTextY, {
      width: leftMargin + sigLineWidth - dateStartX - 4,
      ellipsis: true,
    });

  doc.y = dateUnderlineY + 24;

  doc
    .moveTo(rightX, doc.y + 12)
    .lineTo(rightX + sigLineWidth, doc.y + 12)
    .lineWidth(0.5)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(
      "SIGNATURE OF FACULTY (IN-CHARGE)/ HOD",
      rightX,
      doc.y + 16,
      { width: sigLineWidth }
    );
};

module.exports = { renderComputerCenterRequestingLdapAccountPdf };