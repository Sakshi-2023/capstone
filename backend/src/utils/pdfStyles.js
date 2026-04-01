// PDF Font Sizes
const PDF_FONTS = {
  TITLE: 16,        // Main form/document title
  SECTION_HEADER: 13,  // Section headers (A, B, C, etc.)
  LABEL: 11,        // Field labels
  BODY: 11,         // Body text and field values
  SMALL: 10,        // Small descriptive text
};

// Standard PDF styling functions
const pdfStyles = {
  // Apply main title style
  applyMainTitle: (doc, text) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(PDF_FONTS.TITLE)
      .text(text, { align: "center", underline: true });
    doc.moveDown(0.5);
  },

  // Apply section header style (e.g., "A. Personal Information")
  applySectionHeader: (doc, text) => {
    doc.moveDown(0.3);
    doc
      .font("Helvetica-Bold")
      .fontSize(PDF_FONTS.SECTION_HEADER)
      .text(text);
    doc.moveDown(0.4);
  },

  // Apply field label + value with underline (inline format)
  applyLabeledField: (doc, label, value, lineStartX, lineEndX) => {
    const rowY = doc.y;
    const lineY = rowY + 14;

    doc.font("Helvetica-Bold").fontSize(PDF_FONTS.LABEL).text(label, lineStartX - 100, rowY);
    doc
      .moveTo(lineStartX, lineY)
      .lineTo(lineEndX, lineY)
      .lineWidth(0.5)
      .stroke();

    if (value) {
      doc.font("Helvetica").fontSize(PDF_FONTS.BODY).text(value, lineStartX + 3, rowY, {
        width: lineEndX - lineStartX - 6,
        ellipsis: true,
      });
    }

    doc.y = rowY + 24;
  },

  // Apply field with label on left, value on right
  applyFieldRow: (doc, label, value, indent = 0, leftMargin = 0) => {
    const labelText = `${label}`;
    const valueText = value || "";
    const lineY = doc.y + doc.currentLineHeight(true) - 2;
    const labelWidth = doc.widthOfString(labelText) + 4;
    const valueStartX = leftMargin + indent + labelWidth;
    const lineEndX = leftMargin + 500; // Adjust based on page width

    doc
      .font("Helvetica-Bold")
      .fontSize(PDF_FONTS.LABEL)
      .text(labelText, leftMargin + indent, doc.y, { continued: true });

    doc
      .font("Helvetica")
      .fontSize(PDF_FONTS.BODY)
      .text(` ${valueText}`, { continued: false });

    // underline for value area
    doc
      .moveTo(valueStartX, lineY)
      .lineTo(lineEndX, lineY)
      .lineWidth(0.5)
      .stroke();

    doc.moveDown(0.6);
  },

  // Apply body paragraph text
  applyBodyText: (doc, text, options = {}) => {
    const lineHeight = options.lineHeight || 1.5;
    doc
      .font("Helvetica")
      .fontSize(PDF_FONTS.BODY)
      .text(text, { lineGap: lineHeight - 1, ...options });
  },

  // Apply declaration/header style
  applyDeclarationHeader: (doc, text) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(PDF_FONTS.TITLE)
      .text(text, { align: "center", underline: true });
    doc.moveDown(1.5);
  },

  // Apply signature block
  applySignatureBlock: (doc, label, name, empNo, place, date, rightX, drawWidth) => {
    doc.moveTo(rightX, doc.y).lineTo(rightX + drawWidth, doc.y).stroke();
    doc.moveDown(0.2);

    doc
      .font("Helvetica-Bold")
      .fontSize(PDF_FONTS.LABEL)
      .text(label, rightX, doc.y, {
        width: drawWidth,
        align: "center",
      });

    doc.moveDown(1);
    doc.x = rightX;
    doc.font("Helvetica").fontSize(PDF_FONTS.BODY).text(`Name    : ${name || ""}`);
    doc.x = rightX;
    doc.font("Helvetica").fontSize(PDF_FONTS.BODY).text(`Emp_No. : ${empNo || ""}`);
    doc.x = rightX;
    doc.font("Helvetica").fontSize(PDF_FONTS.BODY).text(`Place   : ${place || ""}`);
    doc.x = rightX;
    doc.font("Helvetica").fontSize(PDF_FONTS.BODY).text(`Date    : ${date || ""}`);

    doc.moveDown(1);
  },

  // Get font size constant
  getFontSize: (type) => PDF_FONTS[type] || PDF_FONTS.BODY,
};

module.exports = pdfStyles;
