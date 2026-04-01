const { getResponseValue, formatDate } = require("../../utils/pdfUtils");
const pdfStyles = require("../../utils/pdfStyles");

const renderSecurityRequisitionForVehicleStickerPdf = (doc, submission) => {
  const responses = submission.responses || {};

  const employeeName = String(getResponseValue(responses, "employeeName") || "").trim();
  const vehicleOwnership = String(getResponseValue(responses, "vehicleOwnership") || "").trim();
  const employeeNo = String(getResponseValue(responses, "employeeNo") || "").trim();
  const designation = String(getResponseValue(responses, "designation") || "").trim();
  const departmentSection = String(getResponseValue(responses, "departmentSection") || "").trim();
  const residentialAddress = String(getResponseValue(responses, "residentialAddress") || "").trim();
  const mobileNo = String(getResponseValue(responses, "mobileNo") || "").trim();
  const instituteEmailId = String(getResponseValue(responses, "instituteEmailId") || "").trim();
  const vehicleNumber = String(getResponseValue(responses, "vehicleNumber") || "").trim();
  const engineNumber = String(getResponseValue(responses, "engineNumber") || "").trim();
  const chassisNo = String(getResponseValue(responses, "chassisNo") || "").trim();
  const vehicleType = String(getResponseValue(responses, "vehicleType") || "").trim();

  const signatureWithDate = String(getResponseValue(responses, "signatureWithDate") || "").trim();

  const officeVehicleStickerNo = String(getResponseValue(responses, "officeVehicleStickerNo") || "").trim();
  const officeDateOfIssue = formatDate(getResponseValue(responses, "officeDateOfIssue"));
  const officeNote = String(getResponseValue(responses, "officeNote") || "").trim();
  const securityOfficerSignature = String(getResponseValue(responses, "securityOfficerSignature") || "").trim();

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const pageWidth = right - left;

  const bodySize = pdfStyles.getFontSize("BODY");
  const labelSize = pdfStyles.getFontSize("LABEL");

  const drawCellText = (text, x, y, width, options = {}) => {
    const padX = options.padX ?? 8;
    const padY = options.padY ?? 6;

    doc
      .font(options.bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(options.fontSize || bodySize)
      .text(text || "", x + padX, y + padY, {
        width: width - padX * 2,
        align: options.align || "left",
        lineGap: options.lineGap ?? 1,
      });
  };

  const drawLine = (x1, y1, x2, y2) => {
    doc
      .moveTo(x1, y1)
      .lineTo(x2, y2)
      .lineWidth(0.8)
      .stroke();
  };

  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize("TITLE"))
    .text("INDIAN INSTITUTE OF TECHNOLOGY PATNA", {
      align: "center",
      underline: true,
    });

  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize("BODY"))
    .text("REQUISITION FOR VEHICLE STICKER", {
      align: "center",
      underline: true,
    });

  doc.moveDown(0.6);

  const mainX = left;
  const mainY = doc.y;
  const mainW = pageWidth;
  const mainRowHeights = [84, 74, 88, 102, 88];
  const mainH = mainRowHeights.reduce((sum, value) => sum + value, 0);
  const labelColW = Math.round(mainW * 0.41);

  doc.rect(mainX, mainY, mainW, mainH).lineWidth(0.8).stroke();

  let runningY = mainY;
  mainRowHeights.slice(0, -1).forEach((rowHeight) => {
    runningY += rowHeight;
    drawLine(mainX, runningY, mainX + mainW, runningY);
  });

  const splitY = mainY + mainRowHeights[0] + mainRowHeights[1] + mainRowHeights[2] + mainRowHeights[3];
  drawLine(mainX + labelColW, mainY, mainX + labelColW, splitY);

  const row1Y = mainY;
  drawCellText(
    "Name of the employee: -\n\nOwnership of the Vehicle: -\n(In case ownership held with\nSpouse/ Mother/Father)",
    mainX,
    row1Y,
    labelColW,
    { fontSize: bodySize, lineGap: 2 }
  );
  drawCellText(employeeName, mainX + labelColW, row1Y + 2, mainW - labelColW, {
    fontSize: bodySize,
    lineGap: 1,
  });
  drawCellText(vehicleOwnership, mainX + labelColW, row1Y + 42, mainW - labelColW, {
    fontSize: bodySize,
    lineGap: 1,
  });

  const row2Y = row1Y + mainRowHeights[0];
  drawCellText("Employee No.: -\n\nDesignation: -\n\nDepartment / Section: -", mainX, row2Y, labelColW, {
    fontSize: bodySize,
    lineGap: 2,
  });
  drawCellText(employeeNo, mainX + labelColW, row2Y + 4, mainW - labelColW, { fontSize: bodySize });
  drawCellText(designation, mainX + labelColW, row2Y + 30, mainW - labelColW, { fontSize: bodySize });
  drawCellText(departmentSection, mainX + labelColW, row2Y + 56, mainW - labelColW, { fontSize: bodySize });

  const row3Y = row2Y + mainRowHeights[1];
  drawCellText("Residential Address: -\n\nMobile No.: -\n\nInstitute e-mail ID", mainX, row3Y, labelColW, {
    fontSize: bodySize,
    lineGap: 2,
  });
  drawCellText(residentialAddress, mainX + labelColW, row3Y + 2, mainW - labelColW, {
    fontSize: bodySize,
    lineGap: 1,
  });
  drawCellText(mobileNo, mainX + labelColW, row3Y + 38, mainW - labelColW, { fontSize: bodySize });
  drawCellText(instituteEmailId, mainX + labelColW, row3Y + 64, mainW - labelColW, { fontSize: bodySize });

  const row4Y = row3Y + mainRowHeights[2];
  drawCellText("Vehicle Number: -\n\nEngine Number: -\n\nChassis No.: -\n\nType of Vehicle: -", mainX, row4Y, labelColW, {
    fontSize: bodySize,
    lineGap: 2,
  });
  drawCellText(vehicleNumber, mainX + labelColW, row4Y + 2, mainW - labelColW, { fontSize: bodySize });
  drawCellText(engineNumber, mainX + labelColW, row4Y + 30, mainW - labelColW, { fontSize: bodySize });
  drawCellText(chassisNo, mainX + labelColW, row4Y + 57, mainW - labelColW, { fontSize: bodySize });
  drawCellText(vehicleType, mainX + labelColW, row4Y + 83, mainW - labelColW, { fontSize: bodySize });

  const row5Y = row4Y + mainRowHeights[3];
  drawCellText(
    "I have enclosed self-attested copy of Owner book (RC Book), Driving Licence and\nInstitute identity Card.",
    mainX,
    row5Y,
    mainW,
    { fontSize: pdfStyles.getFontSize("SECTION_HEADER"), lineGap: 2 }
  );

  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize("SECTION_HEADER"))
    .text(
      signatureWithDate ? `Signature with date: ${signatureWithDate}` : "Signature with date",
      mainX + mainW - 220,
      row5Y + mainRowHeights[4] - 26,
      {
        width: 210,
        align: "right",
      }
    );

  doc.y = mainY + mainH + 24;

  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize("SECTION_HEADER"))
    .text("For office use", {
      align: "center",
      underline: true,
    });

  doc.moveDown(0.9);

  const officeX = mainX;
  const officeY = doc.y;
  const officeW = mainW;
  const officeTopRowH = 50;
  const officeBottomRowH = 54;
  const officeH = officeTopRowH + officeBottomRowH;
  const officeSplitW = Math.round(officeW * 0.6);

  doc.rect(officeX, officeY, officeW, officeH).lineWidth(0.8).stroke();
  drawLine(officeX, officeY + officeTopRowH, officeX + officeW, officeY + officeTopRowH);
  drawLine(officeX + officeSplitW, officeY, officeX + officeSplitW, officeY + officeH);

  drawCellText("Vehicle Sticker No.", officeX, officeY, officeSplitW, {
    fontSize: pdfStyles.getFontSize("SECTION_HEADER"),
  });
  drawCellText("Date of issue", officeX + officeSplitW, officeY, officeW - officeSplitW, {
    fontSize: pdfStyles.getFontSize("SECTION_HEADER"),
    align: "center",
  });

  drawCellText("Office Note:", officeX, officeY + officeTopRowH, officeSplitW, {
    fontSize: pdfStyles.getFontSize("SECTION_HEADER"),
  });

  drawCellText(officeVehicleStickerNo, officeX, officeY + 22, officeSplitW, {
    fontSize: bodySize,
  });
  drawCellText(officeDateOfIssue, officeX + officeSplitW, officeY + 22, officeW - officeSplitW, {
    fontSize: bodySize,
    align: "center",
  });
  drawCellText(officeNote, officeX, officeY + officeTopRowH + 16, officeSplitW, {
    fontSize: bodySize,
  });
  drawCellText(securityOfficerSignature, officeX + officeSplitW, officeY + officeTopRowH + 16, officeW - officeSplitW, {
    fontSize: bodySize,
    align: "center",
  });

  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize("SECTION_HEADER"))
    .text("Signature of Security Officer", officeX + officeSplitW + 8, officeY + officeH - 22, {
      width: officeW - officeSplitW - 16,
      align: "right",
    });

  doc.font("Helvetica").fontSize(labelSize);
};

module.exports = { renderSecurityRequisitionForVehicleStickerPdf };
