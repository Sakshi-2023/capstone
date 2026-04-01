const { getResponseValue, formatDate } = require("../../utils/pdfUtils");
const pdfStyles = require("../../utils/pdfStyles");

const renderSecurityCampusLeavePermissionForFemaleStudentsPdf = (doc, submission) => {
  const responses = submission.responses;

  const name = String(getResponseValue(responses, "name") || "").trim();
  const rollNo = String(getResponseValue(responses, "rollNo") || "").trim();
  const hostelName = String(getResponseValue(responses, "hostelName") || "").trim();
  const gender = String(getResponseValue(responses, "gender") || "Female").trim();
  const dateOfLeaving = formatDate(getResponseValue(responses, "dateOfLeaving"));
  const reasonForLeaving = String(getResponseValue(responses, "reasonForLeaving") || "").trim();

  const companion1Name = String(getResponseValue(responses, "companion1Name") || "").trim();
  const companion1RollNo = String(getResponseValue(responses, "companion1RollNo") || "").trim();
  const companion2Name = String(getResponseValue(responses, "companion2Name") || "").trim();
  const companion2RollNo = String(getResponseValue(responses, "companion2RollNo") || "").trim();

  const leftMargin = doc.page.margins.left;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // ── Header ──────────────────────────────────────────────────────────────────
  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize('TITLE'))
    .text("IIT PATNA", { align: "center", underline: true });

  doc.moveDown(0.8);

  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize('SECTION_HEADER'))
    .text(
      "Campus Leaving Permission after 10:00 PM (For Female Students)",
      { align: "left" }
    );

  doc.moveDown(1.2);

  // ── Fields 1–4 ───────────────────────────────────────────────────────────────
  const underlineField = (label, value, indent = 0) => {
    const labelText = `${label}`;
    const valueText = value || "";
    const lineY = doc.y + doc.currentLineHeight(true) - 2;
    const labelWidth = doc.widthOfString(labelText) + 4;
    const valueStartX = leftMargin + indent + labelWidth;
    const lineEndX = leftMargin + pageWidth * 0.6;

    doc
      .font("Helvetica-Bold")
      .fontSize(pdfStyles.getFontSize('LABEL'))
      .text(labelText, leftMargin + indent, doc.y, { continued: true });

    doc
      .font("Helvetica")
      .fontSize(pdfStyles.getFontSize('BODY'))
      .text(` ${valueText}`, { continued: false });

    // underline for value area
    doc
      .moveTo(valueStartX, lineY)
      .lineTo(lineEndX, lineY)
      .lineWidth(0.5)
      .stroke();

    doc.moveDown(0.6);
  };

  underlineField("1. Name:", name);
  underlineField("2. Roll No:", rollNo);
  underlineField("3. Hostel Name:", hostelName);

  // Field 4: Gender (pre-filled as Female)
  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize('LABEL'))
    .text("4. Gender: ", leftMargin, doc.y, { continued: true });
  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('BODY'))
    .text(gender || "Female");
  doc.moveDown(0.6);

  // Field 5: Date of leaving (DD / MM / YYYY style)
  const dateParts = dateOfLeaving ? dateOfLeaving.split("/") : ["", "", ""];
  const dd = dateParts[0] || "";
  const mm = dateParts[1] || "";
  const yyyy = dateParts[2] || "";

  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize('LABEL'))
    .text("5. Date of leaving IIT Patna campus: ", leftMargin, doc.y, { continued: true });
  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('BODY'))
    .text(`${dd} / ${mm} / ${yyyy}`);
  doc.moveDown(0.6);

  // Field 6: Reason for leaving
  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize('LABEL'))
    .text(
      "6. Reason for leaving campus after 10:00 pm: ",
      leftMargin,
      doc.y,
      { continued: true }
    );
  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('SMALL'))
    .text(
      "(Specifically mention the mode of conveyance, boarding point & destination)",
      { continued: false }
    );

  doc.moveDown(0.35);
  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('BODY'))
    .text(reasonForLeaving, leftMargin, doc.y, { width: pageWidth });

  // underline lines for reason field
  const reasonY1 = doc.y + 20;
  doc
    .moveTo(leftMargin, reasonY1)
    .lineTo(leftMargin + pageWidth, reasonY1)
    .lineWidth(0.5)
    .stroke();
  const reasonY2 = reasonY1 + 18;
  doc
    .moveTo(leftMargin, reasonY2)
    .lineTo(leftMargin + pageWidth, reasonY2)
    .lineWidth(0.5)
    .stroke();

  doc.y = reasonY2 + 12;
  doc.moveDown(0.8);

  // ── Supporting documents note ────────────────────────────────────────────────
  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize('BODY'))
    .text("(Please also enclose the supporting documents)");

  doc.moveDown(0.8);

  // ── Field 7: Companions ───────────────────────────────────────────────────────
  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize('BODY'))
    .text(
      "7. Particulars of student(s) who would accompany the female",
      leftMargin,
      doc.y,
      { continued: true }
    );
  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('BODY'))
    .text(
      " student (Maximum two persons can accompany a female student):",
      { continued: false }
    );

  doc.moveDown(0.8);

  // Companion row helper
  const companionRow = (cName, cRoll) => {
    const nameLabel = "Name ";
    const rollLabel = "Roll No. ";
    const nameLabelWidth = doc.widthOfString(nameLabel);
    const nameLineStart = leftMargin + nameLabelWidth + 2;
    const nameLineEnd = leftMargin + pageWidth * 0.45;
    const rollLabelX = leftMargin + pageWidth * 0.52;
    const rollLineStart = rollLabelX + doc.widthOfString(rollLabel) + 2;
    const rollLineEnd = leftMargin + pageWidth;

    const rowY = doc.y;

    doc.font("Helvetica").fontSize(pdfStyles.getFontSize('BODY')).text(nameLabel, leftMargin, rowY, { continued: false });
    doc.font("Helvetica").fontSize(pdfStyles.getFontSize('BODY')).text(cName || "", leftMargin + nameLabelWidth + 4, rowY - doc.currentLineHeight(true), { continued: false });

    doc.font("Helvetica").fontSize(pdfStyles.getFontSize('BODY')).text(rollLabel, rollLabelX, rowY - doc.currentLineHeight(true) * 1, { continued: false });
    doc.font("Helvetica").fontSize(pdfStyles.getFontSize('BODY')).text(cRoll || "", rollLineStart + 2, rowY - doc.currentLineHeight(true) * 2, { continued: false });

    // underlines
    const underlineY = rowY + 2;
    doc.moveTo(nameLineStart, underlineY).lineTo(nameLineEnd, underlineY).lineWidth(0.5).stroke();
    doc.moveTo(rollLineStart, underlineY).lineTo(rollLineEnd, underlineY).lineWidth(0.5).stroke();

    doc.y = rowY + 20;
    doc.moveDown(0.5);
  };

  companionRow(companion1Name, companion1RollNo);
  companionRow(companion2Name, companion2RollNo);

  doc.moveDown(0.5);

  // ── Approval note ─────────────────────────────────────────────────────────────
  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('SMALL'))
    .text(
      "(Please enclose the appropirate approval & specific purpose for leaving campus to be mentioned in the approval)",
      leftMargin,
      doc.y,
      { width: pageWidth, align: "justify" }
    );

  doc.moveDown(1.5);

  // ── Undertaking text ──────────────────────────────────────────────────────────
  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('BODY'))
    .text(
      "I undertake that I have verified that the student(s) accompanying me, whose details are filled " +
      "in above, have prior approval of their respective wardens to leave the campus after 10:00 PM " +
      "on the date mentioned in Sl. No. 5 of this form. My parents/guardian are aware of my travel " +
      "plan & I own the responsibilities of late-night travelling.",
      leftMargin,
      doc.y,
      { width: pageWidth, align: "justify" }
    );

  doc.moveDown(3);

  // ── Student Signature ─────────────────────────────────────────────────────────
  const sigWidth = 220;
  const sigX = doc.page.width - doc.page.margins.right - sigWidth;

  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('LABEL'))
    .text("Signature of the student with date", sigX, doc.y, {
      width: sigWidth,
      align: "center",
    });

  doc.moveDown(3);

  // ── Warden Section ────────────────────────────────────────────────────────────
  const wardenY = doc.y;

  // Left side: Remarks of the Warden + Hostel Stamp
  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('BODY'))
    .text("Remarks of the Warden", leftMargin, wardenY, { underline: true });

  doc.moveDown(0.4);

  // Draw hostel stamp circle
  const stampCenterX = leftMargin + 50;
  const stampCenterY = doc.y + 35;
  const stampRadius = 35;

  doc
    .circle(stampCenterX, stampCenterY, stampRadius)
    .lineWidth(1.5)
    .strokeColor("#c47c2b")
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('SMALL'))
    .fillColor("#c47c2b")
    .text("Hostel", stampCenterX - 18, stampCenterY - 8)
    .text("Stamp", stampCenterX - 16, stampCenterY + 2)
    .fillColor("black");

  // Right side: Signature of warden
  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('LABEL'))
    .text("Signature of warden", sigX, wardenY + 60, {
      width: sigWidth,
      align: "center",
    });
};

module.exports = { renderSecurityCampusLeavePermissionForFemaleStudentsPdf };
