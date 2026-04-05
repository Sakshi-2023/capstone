const { getResponseValue, formatDate } = require("../../utils/pdfUtils");

const renderComputerCenterProxyLdapAccountRequestPdf = (doc, submission) => {
  const responses = submission.responses;
  const get = (k) => String(getResponseValue(responses, k) || "").trim();

  const data = {
    studentName: get("studentName"),
    studentRollNo: get("studentRollNo"),
    instituteName: get("instituteName"),
    email: get("email"),
    mobileNo: get("mobileNo"),
    department: get("department"),
    phNo: get("phNo"),
    address: get("address"),
    proxyAccount: get("proxyAccount"),
    lastDayDate: formatDate(getResponseValue(responses, "lastDayDate")),
    guideName: get("guideName"),
    guideDesignation: get("guideDesignation"),
    guideDepartment: get("guideDepartment"),
    date: formatDate(getResponseValue(responses, "date")),
    place: get("place"),
  };

  const x = 50;
  const width = 500;
  let y = 50;

  const rowH = 30;
  const PAD = 6;

  // ✅ EQUAL COLUMN SPLIT
  const col = width / 4;

  const drawCell = (x, y, w, h) => doc.rect(x, y, w, h).stroke();

  const write = (text, x, y, bold = false, size = 10, width = null) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size);
    doc.text(text, x, y, width ? { width } : { lineBreak: false });
  };

  const centerY = (top, h) => top + h / 2 - 5;

  // ─── HEADER ─────────────────
  doc.font("Helvetica-Bold").fontSize(16)
    .text("Requisition Form for Trainee", x, y, { align: "center", width });

  y += 20;

  doc.font("Helvetica-Bold").fontSize(12)
    .text("Computer Center, IIT Patna", x, y, { align: "center", width });

  y += 20;
  doc.moveTo(x, y).lineTo(x + width, y).stroke();
  y += 20;

  write("User Information:", x, y, true, 11);
  y += 15;

  // ─── ROW 1 ─────────────────
  for (let i = 0; i < 4; i++) drawCell(x + i * col, y, col, rowH);

  write("Student Name:", x + PAD, centerY(y, rowH), true);
  write(data.studentName, x + col + PAD, centerY(y, rowH), false, 10, col - 10);

  write("Student Roll No.", x + 2 * col + PAD, centerY(y, rowH), true);
  write(data.studentRollNo, x + 3 * col + PAD, centerY(y, rowH), false, 10, col - 10);

  y += rowH;

  // ─── FULL WIDTH ROW ─────────────────
  drawCell(x, y, width, rowH);
  write("Institute/Organization/College Name:", x + PAD, centerY(y, rowH), true);
  write(data.instituteName, x + 190, centerY(y, rowH));

  y += rowH;

  // ─── EMAIL / MOBILE ─────────────────
  for (let i = 0; i < 4; i++) drawCell(x + i * col, y, col, rowH);

  write("Email:", x + PAD, centerY(y, rowH), true);
  write(data.email, x + col + PAD, centerY(y, rowH), false, 10, col - 10);

  write("Mobile No:", x + 2 * col + PAD, centerY(y, rowH), true);
  write(data.mobileNo, x + 3 * col + PAD, centerY(y, rowH), false, 10, col - 10);

  y += rowH;

  // ─── DEPARTMENT / PHONE ─────────────────
  for (let i = 0; i < 4; i++) drawCell(x + i * col, y, col, rowH);

  write("Department:", x + PAD, centerY(y, rowH), true);
  write(data.department, x + col + PAD, centerY(y, rowH), false, 10, col - 10);

  write("Ph. No:", x + 2 * col + PAD, centerY(y, rowH), true);
  write(data.phNo, x + 3 * col + PAD, centerY(y, rowH), false, 10, col - 10);

  y += rowH;

  // ─── ADDRESS ─────────────────
  const addrH = 70;
  drawCell(x, y, col, addrH);
  drawCell(x + col, y, width - col, addrH);

  write("Address:", x + PAD, y + 5, true);
  doc.text(data.address, x + col + PAD, y + 5, { width: width - col - 10 });

  y += addrH;

  // ─── REQUIREMENTS ─────────────────
  y += 10;
  write("Requirements of Proxy Account:", x, y, true);
  y += 15;

  for (let i = 0; i < 4; i++) drawCell(x + i * col, y, col, rowH);

  write("Proxy Account", x + PAD, centerY(y, rowH), true);
  write(data.proxyAccount, x + col + PAD, centerY(y, rowH), false, 10, col - 10);

  write("Last day date", x + 2 * col + PAD, centerY(y, rowH), true);
  write(data.lastDayDate, x + 3 * col + PAD, centerY(y, rowH), false, 10, col - 10);

  y += rowH;

  // ─── GUIDE INFO ─────────────────
  y += 10;
  write("Guide Information:", x, y, true);
  y += 15;

  for (let i = 0; i < 4; i++) drawCell(x + i * col, y, col, rowH);

  write("Guide Name", x + PAD, centerY(y, rowH), true);
  write(data.guideName, x + col + PAD, centerY(y, rowH), false, 10, col - 10);

  write("Designation", x + 2 * col + PAD, centerY(y, rowH), true);
  write(data.guideDesignation, x + 3 * col + PAD, centerY(y, rowH), false, 10, col - 10);

  y += rowH;

  drawCell(x, y, col, rowH);
  drawCell(x + col, y, width - col, rowH);

  write("Department", x + PAD, centerY(y, rowH), true);
  write(data.guideDepartment, x + col + PAD, centerY(y, rowH));

  y += rowH + 20;

  // ─── DATE + PLACE ─────────────────
  write("Date:", x, y);
  doc.moveTo(x + 40, y + 12).lineTo(x + 180, y + 12).stroke();
  write(data.date, x + 45, y);

  write("Place:", x + 220, y);
  doc.moveTo(x + 270, y + 12).lineTo(x + 420, y + 12).stroke();
  write(data.place, x + 275, y);

  y += 80;

  // ─── SIGNATURES (RIGHT SIDE FIXED) ─────────────────
  write("Student Signature", x + width - 130, y);

  y += 80;

  write("Approved", x + width - 110, y, true);

  y += 30;

  write("(Guide Signature)", x + width - 110, y);
};

module.exports = { renderComputerCenterProxyLdapAccountRequestPdf };