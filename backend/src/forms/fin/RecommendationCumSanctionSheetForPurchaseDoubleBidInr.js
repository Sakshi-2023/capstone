const { getResponseValue, formatDate } = require("../../utils/pdfUtils");
const pdfStyles = require("../../utils/pdfStyles");

const sanitize = (value) => String(value || "").replace(/\s+/g, " ").trim();

const normalizeItem = (item = {}) => ({
  description: sanitize(item.description),
  rate: sanitize(item.rate),
  quantity: sanitize(item.quantity),
  amount: sanitize(item.amount),
});

const hasItemContent = (item) => {
  if (!item) return false;
  return ["description", "rate", "quantity", "amount"].some(
    (key) => String(item[key] || "").trim() !== ""
  );
};

const renderFinanceProcurementRecommendationSanctionPdf = (doc, submission) => {
  const responses = submission.responses;

  const purchaseOf = sanitize(getResponseValue(responses, "purchaseOf"));
  const sheetDate = formatDate(getResponseValue(responses, "sheetDate"));
  const niqTenderNo = sanitize(getResponseValue(responses, "niqTenderNo"));
  const niqTenderDate = formatDate(getResponseValue(responses, "niqTenderDate"));
  const vendorsRespondedCount = sanitize(getResponseValue(responses, "vendorsRespondedCount"));
  const priceBidsOpenedOn = formatDate(getResponseValue(responses, "priceBidsOpenedOn"));
  const purchaseCommitteeMembers = sanitize(getResponseValue(responses, "purchaseCommitteeMembers"));

  const fileNo = sanitize(getResponseValue(responses, "fileNo"));
  const yearOfSanction = sanitize(getResponseValue(responses, "yearOfSanction"));
  const department = sanitize(getResponseValue(responses, "department"));
  const category = sanitize(getResponseValue(responses, "category"));

  const vendorName = sanitize(getResponseValue(responses, "vendorName"));
  const vendorAddressLine1 = sanitize(getResponseValue(responses, "vendorAddressLine1"));
  const vendorAddressLine2 = sanitize(getResponseValue(responses, "vendorAddressLine2"));

  const gstPercentage = sanitize(getResponseValue(responses, "gstPercentage"));
  const gstAmount = sanitize(getResponseValue(responses, "gstAmount"));
  const additionalCharge1Label = sanitize(getResponseValue(responses, "additionalCharge1Label")) || "Additional Charge 1";
  const additionalCharge1Amount = sanitize(getResponseValue(responses, "additionalCharge1Amount"));
  const additionalCharge2Label = sanitize(getResponseValue(responses, "additionalCharge2Label")) || "Additional Charge 2";
  const additionalCharge2Amount = sanitize(getResponseValue(responses, "additionalCharge2Amount"));
  const totalAmount = sanitize(getResponseValue(responses, "totalAmount"));

  const member1 = sanitize(getResponseValue(responses, "member1")) || "Member 1";
  const member2 = sanitize(getResponseValue(responses, "member2")) || "Member 2";
  const member3 = sanitize(getResponseValue(responses, "member3")) || "Member 3";
  const member4 = sanitize(getResponseValue(responses, "member4")) || "Member 4";

  const itemsFromArray = Array.isArray(getResponseValue(responses, "items"))
    ? getResponseValue(responses, "items")
        .map((item) => normalizeItem(item))
        .filter(hasItemContent)
    : [];

  const legacyItems = [1, 2, 3, 4, 5]
    .map((index) =>
      normalizeItem({
        description: getResponseValue(responses, `item${index}Description`),
        rate: getResponseValue(responses, `item${index}Rate`),
        quantity: getResponseValue(responses, `item${index}Quantity`),
        amount: getResponseValue(responses, `item${index}Amount`),
      })
    )
    .filter(hasItemContent);

  const mergedItems = itemsFromArray.length > 0 ? itemsFromArray : legacyItems;
  const tableItems =
    mergedItems.length >= 2
      ? mergedItems
      : [...mergedItems, ...Array.from({ length: 2 - mergedItems.length }, () => normalizeItem())];

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const bodySize = pdfStyles.getFontSize("BODY");
  const labelSize = pdfStyles.getFontSize("LABEL");

  const drawLabeledLine = (label, value, options = {}) => {
    const startY = doc.y;
    const labelX = options.labelX || left;
    const valueLineStart = options.valueLineStart || labelX + 150;
    const valueLineEnd = options.valueLineEnd || right;
    const lineY = startY + 12;

    doc.font("Helvetica-Bold").fontSize(labelSize).text(label, labelX, startY);
    doc.moveTo(valueLineStart, lineY).lineTo(valueLineEnd, lineY).lineWidth(0.5).stroke();

    if (value) {
      doc
        .font("Helvetica")
        .fontSize(bodySize)
        .text(value, valueLineStart + 2, startY, {
          width: Math.max(20, valueLineEnd - valueLineStart - 4),
          ellipsis: true,
        });
    }

    doc.y = startY + (options.rowHeight || 18);
  };

  doc.font("Helvetica-Bold").fontSize(14).text("Format for procurement in INR using Double Bid Tendering process", {
    align: "center",
  });

  doc.moveDown(0.45);

  doc.font("Helvetica").fontSize(16).text("Recommendation cum Sanction Sheet for the purchase of -", {
    align: "center",
    underline: true,
  });
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(purchaseOf || "---------------", { align: "center" });

  doc.moveDown(0.25);
  doc
    .font("Helvetica")
    .fontSize(bodySize)
    .text(`Date: ${sheetDate || "dd-mm-yyyy"}`, right - 150, doc.y, {
      width: 150,
      align: "right",
    });

  doc.moveDown(0.3);
  doc
    .font("Helvetica")
    .fontSize(bodySize)
    .text(
      `Quotations for the supply of ${purchaseOf || "-----------"} were invited, through NIQ/Tender No. ${
        niqTenderNo || "-----------"
      }, dated ${niqTenderDate || "dd-mm-yyyy"}. Responses were received from ${
        vendorsRespondedCount || "----"
      } vendors as given in the quotation opening report.`,
      left,
      doc.y,
      { align: "justify" }
    );

  doc.moveDown(0.35);
  doc
    .font("Helvetica")
    .fontSize(bodySize)
    .text(
      `The price bids of ${vendorsRespondedCount || "---"} technically satisfied firms were opened on ${
        priceBidsOpenedOn || "dd-mm-yyyy"
      }, in the presence of purchase committee members${
        purchaseCommitteeMembers ? ` (${purchaseCommitteeMembers})` : ""
      }, after the approval of the Director, IIT Patna. The item wise details of rate are given in Annexure-2.`,
      left,
      doc.y,
      { align: "justify" }
    );

  doc.moveDown(0.35);
  doc
    .font("Helvetica")
    .fontSize(bodySize)
    .text(
      `The purchase committee recommends to place the order for ${purchaseOf || "-----------"} with M/s ${
        vendorName || "-----------"
      }, the lowest quoter, as per details given in the table below.`,
      left,
      doc.y,
      { align: "justify" }
    );

  doc.moveDown(0.5);

  drawLabeledLine("File No.:", fileNo, { valueLineStart: left + 62, valueLineEnd: left + 230, rowHeight: 16 });
  drawLabeledLine("Year of Sanction:", yearOfSanction, {
    valueLineStart: left + 106,
    valueLineEnd: left + 230,
    rowHeight: 16,
  });
  drawLabeledLine("Department:", department, { valueLineStart: left + 83, valueLineEnd: left + 230, rowHeight: 16 });
  drawLabeledLine("Category:", category, { valueLineStart: left + 68, valueLineEnd: left + 230, rowHeight: 16 });

  const vendorLine1 = vendorName || "";
  const vendorLine2 = vendorAddressLine1 || vendorAddressLine2 || "";
  const vendorLine3 = vendorAddressLine1 && vendorAddressLine2 ? vendorAddressLine2 : "";

  drawLabeledLine("Vendor:", vendorLine1, { valueLineStart: left + 53, valueLineEnd: left + 250, rowHeight: 16 });
  drawLabeledLine("", vendorLine2, { labelX: left + 53, valueLineStart: left + 53, valueLineEnd: left + 250, rowHeight: 16 });
  drawLabeledLine("", vendorLine3, { labelX: left + 53, valueLineStart: left + 53, valueLineEnd: left + 250, rowHeight: 16 });

  doc.moveDown(0.25);

  const tableX = left;
  const tableY = doc.y;
  const colWidths = [42, 220, 75, 75, 93];
  const itemRowHeights = tableItems.map(() => 20);
  const summaryRowHeights = [20, 20, 20, 22];
  const rowHeights = [22, ...itemRowHeights, ...summaryRowHeights];
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  const tableHeight = rowHeights.reduce((sum, height) => sum + height, 0);

  doc.rect(tableX, tableY, tableWidth, tableHeight).lineWidth(0.6).stroke();

  let verticalX = tableX;
  colWidths.forEach((width, index) => {
    verticalX += width;
    if (index < colWidths.length - 1) {
      doc.moveTo(verticalX, tableY).lineTo(verticalX, tableY + tableHeight).lineWidth(0.6).stroke();
    }
  });

  let horizontalY = tableY;
  rowHeights.forEach((height, index) => {
    horizontalY += height;
    if (index < rowHeights.length - 1) {
      doc.moveTo(tableX, horizontalY).lineTo(tableX + tableWidth, horizontalY).lineWidth(0.5).stroke();
    }
  });

  const writeCell = (rowIndex, colIndex, text, options = {}) => {
    const cellX = tableX + colWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0);
    const cellY = tableY + rowHeights.slice(0, rowIndex).reduce((sum, height) => sum + height, 0);
    const width = colWidths[colIndex];
    const height = rowHeights[rowIndex];

    doc
      .font(options.bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(options.fontSize || 9.5)
      .text(text || "", cellX + 3, cellY + 4, {
        width: width - 6,
        height: height - 6,
        align: options.align || "left",
        ellipsis: true,
      });
  };

  writeCell(0, 0, "Sl. No.", { bold: true, align: "center" });
  writeCell(0, 1, "Item description (with product code, if any)", { bold: true, align: "center" });
  writeCell(0, 2, "Rate", { bold: true, align: "center" });
  writeCell(0, 3, "Quantity", { bold: true, align: "center" });
  writeCell(0, 4, "Amount", { bold: true, align: "center" });

  tableItems.forEach((item, index) => {
    const row = index + 1;
    writeCell(row, 0, `${index + 1}.`, { align: "center" });
    writeCell(row, 1, item.description);
    writeCell(row, 2, item.rate, { align: "center" });
    writeCell(row, 3, item.quantity, { align: "center" });
    writeCell(row, 4, item.amount, { align: "right" });
  });

  const summaryStartRow = 1 + tableItems.length;

  writeCell(summaryStartRow, 1, `GST @${gstPercentage || "--"}%`, { align: "right" });
  writeCell(summaryStartRow, 4, gstAmount, { align: "right" });

  writeCell(summaryStartRow + 1, 1, additionalCharge1Label, { align: "right" });
  writeCell(summaryStartRow + 1, 4, additionalCharge1Amount, { align: "right" });

  writeCell(summaryStartRow + 2, 1, additionalCharge2Label, { align: "right" });
  writeCell(summaryStartRow + 2, 4, additionalCharge2Amount, { align: "right" });

  writeCell(summaryStartRow + 3, 1, "Total Amount", { align: "right", bold: true });
  writeCell(summaryStartRow + 3, 4, totalAmount, { align: "right", bold: true });

  doc.y = tableY + tableHeight + 12;

  doc
    .font("Helvetica")
    .fontSize(bodySize)
    .text("Amount as per details given in the above table may be sanctioned.", left, doc.y, {
      align: "center",
    });

  doc.moveDown(2.2);

  const signRowY = doc.y;
  const signWidth = (right - left) / 4;

  [member1, member2, member3, member4].forEach((member, index) => {
    const x = left + index * signWidth;
    doc
      .font("Helvetica")
      .fontSize(bodySize)
      .text(`(${member})`, x, signRowY, {
        width: signWidth,
        align: "center",
      });
  });

  doc.moveDown(1.5);

  const hodLineY = doc.y + 10;
  const hodLineStart = right - 120;
  const hodLineEnd = right;

  doc
    .moveTo(hodLineStart, hodLineY)
    .lineTo(hodLineEnd, hodLineY)
    .lineWidth(0.5)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(bodySize)
    .text("(HoD)", hodLineStart, hodLineY + 4, {
      width: 120,
      align: "center",
    });

  doc.y = hodLineY + 24;
  doc.moveDown(1.4);

  const registrarLineY = doc.y + 10;
  const registrarLineStart = left + 24;
  const registrarLineEnd = left + 164;
  const directorLineStart = right - 180;
  const directorLineEnd = right;

  doc
    .moveTo(registrarLineStart, registrarLineY)
    .lineTo(registrarLineEnd, registrarLineY)
    .lineWidth(0.5)
    .stroke();

  doc
    .moveTo(directorLineStart, registrarLineY)
    .lineTo(directorLineEnd, registrarLineY)
    .lineWidth(0.5)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(bodySize)
    .text("Registrar", registrarLineStart, registrarLineY + 4, {
      width: registrarLineEnd - registrarLineStart,
      align: "center",
    });

  const directorY = registrarLineY + 4;
  doc
    .font("Helvetica-Bold")
    .fontSize(bodySize)
    .text("Director", directorLineStart, directorY, {
      width: directorLineEnd - directorLineStart,
      align: "center",
    });
  doc
    .font("Helvetica-Bold")
    .fontSize(bodySize)
    .text("IIT Patna", directorLineStart, directorY + 14, {
      width: directorLineEnd - directorLineStart,
      align: "center",
    });
};

module.exports = { renderFinanceProcurementRecommendationSanctionPdf };
