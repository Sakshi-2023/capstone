const { getResponseValue, formatDate } = require("../../utils/pdfUtils");
const pdfStyles = require("../../utils/pdfStyles");

const renderGenAdminVehicleRequisitionPdf = (doc, submission) => {
  const responses = submission.responses;

  const refNo = String(getResponseValue(responses, "refNo") || "").trim();
  const dated = formatDate(getResponseValue(responses, "dated"));
  const indentorName = String(getResponseValue(responses, "indentorName") || "").trim();
  const indentorDesignation = String(getResponseValue(responses, "indentorDesignation") || "").trim();
  const indentorDepartment = String(getResponseValue(responses, "indentorDepartment") || "").trim();
  const indentorDetails = String(getResponseValue(responses, "indentorDetails") || "").trim();

  const composedIndentorDetails =
    [indentorName, indentorDesignation, indentorDepartment].filter(Boolean).join(", ") ||
    indentorDetails;

  const vehicleTypeRequired = String(getResponseValue(responses, "vehicleTypeRequired") || "").trim();
  const vehicleRequiredDate = formatDate(getResponseValue(responses, "vehicleRequiredDate"));
  const vehicleRequiredPlace = String(getResponseValue(responses, "vehicleRequiredPlace") || "").trim();
  const vehicleRequiredTime = String(getResponseValue(responses, "vehicleRequiredTime") || "").trim();
  const vehicleRequiredUpto = String(getResponseValue(responses, "vehicleRequiredUpto") || "").trim();
  const placesToBeVisited = String(getResponseValue(responses, "placesToBeVisited") || "").trim();
  const guestNames = String(getResponseValue(responses, "guestNames") || "").trim();
  const flightOrTrainNo = String(getResponseValue(responses, "flightOrTrainNo") || "").trim();
  const arrivalDepartureTime = String(getResponseValue(responses, "arrivalDepartureTime") || "").trim();
  const isOfficial = String(getResponseValue(responses, "isOfficial") || "").trim();
  const officialPurpose = String(getResponseValue(responses, "officialPurpose") || "").trim();
  const signatureDate = formatDate(getResponseValue(responses, "signatureDate"));

  const allottedVehicleNo = String(getResponseValue(responses, "allottedVehicleNo") || "").trim();
  const allottedVehicleType = String(getResponseValue(responses, "allottedVehicleType") || "").trim();
  const allottedDriver = String(getResponseValue(responses, "allottedDriver") || "").trim();
  const driverReportTo = String(getResponseValue(responses, "driverReportTo") || "").trim();
  const driverReportDate = formatDate(getResponseValue(responses, "driverReportDate"));
  const driverReportPlace = String(getResponseValue(responses, "driverReportPlace") || "").trim();
  const driverReportTime = String(getResponseValue(responses, "driverReportTime") || "").trim();

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const pageBottom = doc.page.height - doc.page.margins.bottom;
  const bodySize = pdfStyles.getFontSize("BODY");
  const labelSize = pdfStyles.getFontSize("LABEL");

  const ensureRoom = (requiredHeight) => {
    if (doc.y + requiredHeight <= pageBottom) {
      return;
    }
    doc.addPage();
  };

  const writeValue = (value, x, y, width) => {
    if (!value || width <= 0) {
      return;
    }

    const compactValue = String(value).replace(/\s+/g, " ").trim();

    // Clip value rendering to its underline area so long values never overlap labels.
    doc.save();
    doc.rect(x, y - 1, width, 13).clip();
    doc
      .font("Helvetica")
      .fontSize(bodySize)
      .text(compactValue, x, y, {
        lineBreak: false,
      });
    doc.restore();
  };

  const drawUnderline = (x1, x2, y) => {
    doc
      .moveTo(x1, y)
      .lineTo(x2, y)
      .lineWidth(0.45)
      .stroke();
  };

  const drawRuleField = (label, value, options = {}) => {
    ensureRoom(20);
    const rowY = doc.y;
    const lineEndX = options.lineEndX || right;
    const rowHeight = options.rowHeight || 18;

    doc
      .font("Helvetica")
      .fontSize(labelSize)
      .text(label, left, rowY);

    const labelWidth = doc.widthOfString(label);
    const defaultLineStart = options.lineStartX || left + 235;
    const computedLineStart = left + labelWidth + 14;
    const lineStartX = Math.max(defaultLineStart, computedLineStart);
    const safeLineStartX = Math.min(lineStartX, lineEndX - 45);

    const lineY = rowY + 12;
    drawUnderline(safeLineStartX, lineEndX, lineY);
    writeValue(value, safeLineStartX + 2, rowY, lineEndX - safeLineStartX - 4);

    doc.y = rowY + rowHeight;
  };

  const drawLineValue = (xStart, xEnd, y, value) => {
    drawUnderline(xStart, xEnd, y);
    writeValue(value, xStart + 2, y - 11, xEnd - xStart - 4);
  };

  ensureRoom(40);
  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize("TITLE"))
    .text("INDIAN INSTITUTE OF TECHNOLOGY PATNA", { align: "center" });
  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize("SECTION_HEADER"))
    .text("INDENT FOR TRANSPORT", { align: "center", underline: true });

  const topLineY = doc.y + 1;
  drawUnderline(left, right, topLineY);

  doc.y = topLineY + 5;

  const metaY = doc.y;
  doc.font("Helvetica").fontSize(labelSize).text("Ref. No.:", left, metaY);
  drawLineValue(left + 44, left + 145, metaY + 11, refNo);

  doc.font("Helvetica").fontSize(labelSize).text("Dated:", right - 120, metaY);
  drawLineValue(right - 82, right, metaY + 11, dated);
  doc.y = metaY + 18;



  doc.moveDown(0.45);

  drawRuleField("1. Name, Designation & Dept./Section/Centre of the Indentor", composedIndentorDetails);
  drawRuleField("2. Type of vehicle required", vehicleTypeRequired);

  drawRuleField("3. Vehicle required          (a) on (date)", vehicleRequiredDate);
  drawRuleField("                           (b) at (place)", vehicleRequiredPlace);

  ensureRoom(20);
  const threeCY = doc.y;
  doc
    .font("Helvetica")
    .fontSize(labelSize)
    .text("                           (c) at (time)", left, threeCY);

  const timeStart = left + 235;
  const timeEnd = left + 365;
  drawLineValue(timeStart, timeEnd, threeCY + 13, vehicleRequiredTime);

  doc
    .font("Helvetica")
    .fontSize(labelSize)
    .text("up to", timeEnd + 8, threeCY);

  const uptoStart = timeEnd + 40;
  drawLineValue(uptoStart, right, threeCY + 13, vehicleRequiredUpto);
  doc.y = threeCY + 18;

  drawRuleField("4. Place(s) to be visited", placesToBeVisited);

  drawRuleField("5. For duty to receive guest", "");
  drawRuleField("   (a) Name(s) of the guest(s) (if applicable)", guestNames, { lineStartX: left + 302 });
  drawRuleField("   (b) Flight No./Train No.", flightOrTrainNo);
  drawRuleField("   (c) Arrival / Departure time", arrivalDepartureTime);

  drawRuleField("6. Is it official (Yes / No)", isOfficial);
  drawRuleField("   (If yes, please specify the purpose)", officialPurpose);

  doc.moveDown(0.65);

  ensureRoom(52);
  const signLineWidth = 165;
  const signY = doc.y + 6;
  const rightSignX = right - signLineWidth;

  drawUnderline(left, left + signLineWidth, signY);
  drawUnderline(rightSignX, rightSignX + signLineWidth, signY);

  doc
    .font("Helvetica")
    .fontSize(labelSize)
    .text("Signature of the HOD/HOS", left, signY + 4);

  doc
    .font("Helvetica")
    .fontSize(labelSize)
    .text("Date :", left, signY + 20);
  drawLineValue(left + 30, left + signLineWidth, signY + 35, signatureDate);

  doc
    .font("Helvetica")
    .fontSize(labelSize)
    .text("Signature of Indentor", rightSignX, signY + 4, {
      width: signLineWidth,
      align: "center",
    });

  doc.y = signY + 40;
  doc.moveDown(0.55);

  ensureRoom(120);
  const officeRuleY = doc.y;
  drawUnderline(left, right, officeRuleY);
  

  doc.y = officeRuleY + 8;
  doc
    .font("Helvetica-Bold")
    .fontSize(labelSize)
    .text("Vehicle Allotment Slip (for office use only)", {
      align: "center",
      underline: true,
    });

  doc.moveDown(0.55);

  const drawOfficeField = (label, value) => {
    ensureRoom(18);
    const rowY = doc.y;
    doc.font("Helvetica").fontSize(labelSize).text(label, left, rowY);
    doc.font("Helvetica").fontSize(labelSize).text(":", left + 200, rowY);
    drawLineValue(left + 210, right - 45, rowY + 12, value);
    doc.y = rowY + 17;
  };

  drawOfficeField("Vehicle allotted     (a) Vehicle No.", allottedVehicleNo);
  drawOfficeField("                             (b) Type", allottedVehicleType);
  drawOfficeField("                             (c) Driver", allottedDriver);

  doc.moveDown(0.3);

  ensureRoom(48);
  const line1Y = doc.y;
  const line1Prefix = "The Driver is requested to report to Dr./Mr./Mrs.";
  doc.font("Helvetica").fontSize(bodySize).text(line1Prefix, left, line1Y);

  const line1Start = left + doc.widthOfString(`${line1Prefix} `) + 2;
  drawLineValue(line1Start, right - 10, line1Y + 12, driverReportTo);

  doc.y = line1Y + 22;

  const line2Y = doc.y;
  doc.font("Helvetica").fontSize(bodySize).text("(date)", left, line2Y);
  drawLineValue(left + 32, left + 110, line2Y + 12, driverReportDate);

  doc.font("Helvetica").fontSize(bodySize).text("at (place)", left + 116, line2Y);
  drawLineValue(left + 172, left + 285, line2Y + 12, driverReportPlace);

  doc.font("Helvetica").fontSize(bodySize).text("at (time)", left + 291, line2Y);
  drawLineValue(left + 342, left + 417, line2Y + 12, driverReportTime);

  doc
    .font("Helvetica")
    .fontSize(bodySize)
    .text("and report back to the undersigned / office", left + 422, line2Y, {
      width: right - (left + 422),
    });

  doc.y = line2Y + 20;
  doc
    .font("Helvetica")
    .fontSize(bodySize)
    .text("after performing the duty.", left, doc.y);

  doc.moveDown(1.1);

  ensureRoom(22);
  const transportSignY = doc.y + 10;
  const transportSignX = right - 100;
  drawUnderline(transportSignX, right, transportSignY);

  doc
    .font("Helvetica")
    .fontSize(labelSize)
    .text("Transport In-charge", transportSignX, transportSignY + 4, {
      width: 100,
      align: "center",
    });
};

module.exports = { renderGenAdminVehicleRequisitionPdf };
