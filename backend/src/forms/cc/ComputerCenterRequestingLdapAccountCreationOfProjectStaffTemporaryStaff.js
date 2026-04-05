const { getResponseValue, formatDate } = require("../../utils/pdfUtils");

const renderComputerCenterRequestingLdapAccountPdf = (doc, submission) => {
  const responses = submission.responses;
  const get = (k) => String(getResponseValue(responses, k) || "").trim();

  const data = {
    empId: get("empIdProjectId"),
    name: get("fullName"),
    dept: get("department"),
    phone: get("phoneMobileNo"),
    email: get("personalEmailId"),
    address: get("address"),
    iitpEmail: get("iitpEmailId"),
    validity: formatDate(getResponseValue(responses, "validityLastDate")),
    date: formatDate(getResponseValue(responses, "requestDate")),
  };

  const x = 50;
  const width = 500;
  let y = 50;

  const rowH = 30;
  const PAD = 6;

  // ✅ FIXED COLUMN POSITIONS
  const colA = 40;   // A/B/C
  const colNum = 40; // 1,2,3...
  const colLabel = 180;
  const colValue = width - (colA + colNum + colLabel);

  const xA = x;
  const xNum = xA + colA;
  const xLabel = xNum + colNum;
  const xValue = xLabel + colLabel;

  const draw = (x, y, w, h) => doc.rect(x, y, w, h).stroke();

  const text = (t, x, y, bold = false, size = 10, w = null) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size);
    doc.text(t, x, y, w ? { width: w } : { lineBreak: false });
  };

  const centerY = (top, h) => top + h / 2 - 5;

  // ─── HEADER ─────────────────
  doc.font("Helvetica-Bold")
    .fontSize(14)
    .text("INDIAN INSTITUTE OF TECHNOLOGY PATNA", x, y, {
      align: "center",
      width,
    });

  y += 20;

  // Draw the horizontal line
  doc.moveTo(x, y).lineTo(x + width, y).stroke();

  // Draw black label OVER the line (not below it)
  const boxWidth = 150;
  const boxHeight = 18;
  const boxX = x + width - boxWidth;
  const boxY = y - boxHeight / 2; // 👈 KEY FIX (center on line)

  doc.rect(boxX, boxY, boxWidth, boxHeight).fill("black");

  // Text inside box
  doc.fillColor("white")
    .fontSize(10)
    .text("COMPUTER CENTRE", boxX, boxY + 4, {
      width: boxWidth,
      align: "center",
    });

  doc.fillColor("black"); // reset

  y += 35;

  doc.font("Helvetica-Bold").fontSize(12)
    .text("REQUEST / REQUISITION FORM", x, y, { align: "center", width });

  doc.font("Helvetica").fontSize(10)
    .text("(For LDAP Account)", x, y + 15, { align: "center", width });

  y += 40;

  // ─── SECTION A ─────────────────
  const totalHeight = rowH * 6 + 60;

  // OUTER BOX
  draw(x, y, width, totalHeight);

  // A column
  draw(xA, y, colA, totalHeight);
  text("A.", xA + 12, y + 10, true);

  // header row
  draw(xNum, y, width - colA, rowH);
  text("Personal Information (PLEASE FILL IN BLOCK LETTERS)", xNum + PAD, y + 8);

  let yy = y + rowH;

  const rows = [
    ["1.", "Emp. ID/Project ID", data.empId],
    ["2.", "Full Name", data.name],
    ["3.", "Dept./Section/Centre", data.dept],
    ["4.", "Phone/Mobile No.:", data.phone],
    ["5.", "Personal Email-ID", data.email],
  ];

  rows.forEach(([n, l, v]) => {
    draw(xNum, yy, colNum, rowH);
    draw(xLabel, yy, colLabel, rowH);
    draw(xValue, yy, colValue, rowH);

    text(n, xNum + 10, centerY(yy, rowH));
    text(l, xLabel + PAD, centerY(yy, rowH));
    text(v, xValue + PAD, centerY(yy, rowH));

    yy += rowH;
  });

  // ADDRESS
  const addrH = 60;

  draw(xNum, yy, colNum, addrH);
  draw(xLabel, yy, colLabel, addrH);
  draw(xValue, yy, colValue, addrH);

  text("6.", xNum + 10, yy + 10);
  text("Address:", xLabel + PAD, yy + 10, true);
  doc.text(data.address, xValue + PAD, yy + 10, { width: colValue - 10 });

  y = yy + addrH;

  // ─── SECTION B ─────────────────
  draw(xA, y, colA, rowH);
  draw(xNum, y, colNum + colLabel, rowH);
  draw(xValue, y, colValue, rowH);

  text("B.", xA + 12, centerY(y, rowH), true);
  text("IITP Email id (If any):", xNum + PAD, centerY(y, rowH));
  text(data.iitpEmail, xValue + PAD, centerY(y, rowH));

  y += rowH;

  // ─── SECTION C ─────────────────
  draw(xA, y, colA, rowH);
  draw(xNum, y, colNum + colLabel, rowH);
  draw(xValue, y, colValue, rowH);

  text("C.", xA + 12, centerY(y, rowH), true);
  text("Validity date / Last Date for LDAP account", xNum + PAD, centerY(y, rowH));
  text(data.validity, xValue + PAD, centerY(y, rowH));

  y += 60;

  // ─── SIGNATURES ─────────────────
  const sigW = 180;

  doc.moveTo(x + width - sigW, y)
     .lineTo(x + width, y)
     .stroke();

  text("SIGNATURE", x + width - sigW + 40, y + 5, true);

  y += 30;

  text("Date:", x + width - sigW, y);
  doc.moveTo(x + width - sigW + 40, y + 12)
     .lineTo(x + width, y + 12)
     .stroke();

  text(data.date, x + width - sigW + 45, y);

  y += 60;

  doc.moveTo(x, y)
     .lineTo(x + 220, y)
     .stroke();

  text("SIGNATURE OF FACULTY (IN-CHARGE)/ HOD", x, y + 5, true);
};

module.exports = { renderComputerCenterRequestingLdapAccountPdf };