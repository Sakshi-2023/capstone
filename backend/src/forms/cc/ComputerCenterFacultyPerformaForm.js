const { getResponseValue } = require("../../utils/pdfUtils");

const renderComputerCenterFacultyPerformaPdf = (doc, submission) => {
  const responses = submission.responses;
  const get = (k) => String(getResponseValue(responses, k) || "").trim();

  // Parse HAQ
  let haqRaw = getResponseValue(responses, "highestAcademicQualification");
  if (typeof haqRaw === "string") {
    try { haqRaw = JSON.parse(haqRaw); } catch { haqRaw = []; }
  }
  const haqRows = Array.isArray(haqRaw) ? haqRaw : [];

  const data = {
    name: get("name"),
    designation: get("designation"),
    department: get("department"),
    phoneOffice: get("phoneOffice"),
    iitpEmailId: get("iitpEmailId"),
    personalWebpage: get("personalWebpage"),
    researchAreas: get("researchAreas"),
    otherInterests: get("otherInterests"),
    coursesTaught: get("coursesTaught"),
    noOfPhDStudents: get("noOfPhDStudents"),
    professionalExperience: get("professionalExperience"),
    awardsHonours: get("awardsHonours"),
    memberOfProfessionalBodies: get("memberOfProfessionalBodies"),
    books: get("books"),
    publications: get("publications"),
    presentations: get("presentations"),
    photo: submission.photo && submission.photo.data ? submission.photo.data : null,
  };

  // Layout
  const xL = 58;
  const xM = 190;
  const xR = 544;
  const PAD = 4;
  const LW = 0.7;

  // Slightly increased photo width
  const xPhoto = 370;

  const hLine = (y) => doc.moveTo(xL, y).lineTo(xR, y).lineWidth(LW).stroke();
  const hLineSpan = (x1, x2, y) => doc.moveTo(x1, y).lineTo(x2, y).lineWidth(LW).stroke();
  const vLine = (x, y1, y2) => doc.moveTo(x, y1).lineTo(x, y2).lineWidth(LW).stroke();

  const text = (t, x, y, size = 9, bold = false, opts = {}) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size);
    doc.text(String(t), x, y, { lineBreak: false, ...opts });
  };

  const centerY = (top, bottom, size = 9) => top + (bottom - top - size) / 2;

  const drawRow = (label1, label2, value, top, height) => {
    const bottom = top + height;

    hLine(top);
    hLine(bottom);
    vLine(xL, top, bottom);
    vLine(xM, top, bottom);
    vLine(xR, top, bottom);

    if (label2) {
      text(label1, xL + PAD, top + PAD + 2, 9, true);
      text(label2, xL + PAD, top + PAD + 13, 9, true);
    } else {
      text(label1, xL + PAD, centerY(top, bottom), 9, true);
    }

    if (value) {
      doc.font("Helvetica").fontSize(9);
      doc.text(value, xM + PAD, top + PAD, {
        width: xR - xM - 2 * PAD,
      });
    }

    return bottom;
  };

  // Title
  text("Performa for Faculty Home Page", xL, 70, 12, true);
  doc.moveTo(xL, 84).lineTo(xR, 84).stroke();

  // Name / Designation / Department
  const rowH = 18;
  const rows3 = [
    { label: "Name", value: data.name },
    { label: "Designation", value: data.designation },
    { label: "Department", value: data.department },
  ];

  let top = 90;
  const photoTop = top;
  const photoBottom = top + rowH * 3;

  rows3.forEach(({ label, value }) => {
    const bottom = top + rowH;

    // FIX: prevent lines in photo section
    hLineSpan(xL, xPhoto, top);

    vLine(xL, top, bottom);
    vLine(xM, top, bottom);

    hLineSpan(xM, xPhoto, bottom);

    vLine(xPhoto, top, bottom);
    vLine(xR, top, bottom);

    text(label, xL + PAD, centerY(top, bottom), 9, true);
    if (value) text(value, xM + PAD, centerY(top, bottom));

    top = bottom;
  });

  // Photo borders
  hLine(photoTop);
  hLine(photoBottom);

  text("Photograph / send through email", xPhoto + PAD, photoTop + 4, 8);

  // Bigger, centered image
  const imgPadding = 2;
  const imgX = xPhoto + imgPadding;
  const imgY = photoTop + 14;
  const imgW = xR - xPhoto - 2 * imgPadding;
  const imgH = photoBottom - imgY - 4;

  if (data.photo) {
    try {
      console.log("Photo data type:", typeof data.photo);
      console.log("Is Buffer:", Buffer.isBuffer(data.photo));
      console.log("Photo length:", data.photo.length || 'undefined');
      console.log("Content type:", submission.photo?.contentType);

      if (Buffer.isBuffer(data.photo) && data.photo.length > 0) {
        // Create a temporary file for the image
        const fs = require('fs');
        const path = require('path');
        const os = require('os');

        // Get file extension from content type
        const mimeType = submission.photo?.contentType || 'image/jpeg';
        let extension = '.jpg';
        if (mimeType === 'image/png') extension = '.png';
        else if (mimeType === 'image/gif') extension = '.gif';
        else if (mimeType === 'image/bmp') extension = '.bmp';

        // Create temporary file path
        const tempDir = os.tmpdir();
        const tempFileName = `photo_${Date.now()}${extension}`;
        const tempFilePath = path.join(tempDir, tempFileName);

        // Write the buffer to temporary file
        fs.writeFileSync(tempFilePath, data.photo);

        // Use the temporary file in PDF
        doc.image(tempFilePath, imgX, imgY, {
          fit: [imgW, imgH],
          align: "center",
          valign: "center",
        });

        // Clean up temporary file after a short delay
        setTimeout(() => {
          try {
            fs.unlinkSync(tempFilePath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }, 1000);

      } else {
        console.log("Photo data is empty or not a buffer");
        doc.rect(imgX, imgY, imgW, imgH).stroke();
        text("No photo data", imgX + 5, imgY + imgH / 2 - 4, 8);
      }
    } catch (e) {
      console.error("Error rendering image:", e);
      console.error("Image details:", {
        type: typeof data.photo,
        isBuffer: Buffer.isBuffer(data.photo),
        length: data.photo?.length,
        contentType: submission.photo?.contentType
      });
      doc.rect(imgX, imgY, imgW, imgH).stroke();
      text("Image error", imgX + 5, imgY + imgH / 2 - 4, 8);
    }
  }

  top = photoBottom;

  // Highest Academic Qualification
  const haqTop = top;
  const haqBottom = haqTop + 80;
  const numCols = 4;
  const colW = (xR - xM) / numCols;
  const headerH = 16;
  const dataRowH = (haqBottom - haqTop - headerH) / 3;

  hLine(haqTop);
  hLine(haqBottom);
  vLine(xL, haqTop, haqBottom);
  vLine(xR, haqTop, haqBottom);

  text("Highest Academic", xL + PAD, haqTop + 6, 9, true);
  text("Qualification", xL + PAD, haqTop + 18, 9, true);

  vLine(xM, haqTop, haqBottom);
  hLineSpan(xM, xR, haqTop + headerH);

  const headers = ["Degree", "Subject", "University Institute", "Year"];
  headers.forEach((h, i) => {
    vLine(xM + (i + 1) * colW, haqTop, haqBottom);
    text(h, xM + i * colW + PAD, haqTop + 4, 8, true);
  });

  for (let r = 0; r < 3; r++) {
    const rowTop = haqTop + headerH + r * dataRowH;
    if (r > 0) hLineSpan(xM, xR, rowTop);

    const row = haqRows[r] || {};
    const vals = [
      row.degree || "",
      row.subject || "",
      row.university || "",
      row.year || "",
    ];

    vals.forEach((val, c) => {
      if (val) text(val, xM + c * colW + PAD, rowTop + 4, 8);
    });
  }

  top = haqBottom;

  // Phone + Email
  const xP1 = xM + (xR - xM) / 2;
  const phH = 18;
  const phBottom = top + phH;

  hLine(top);
  hLine(phBottom);
  vLine(xL, top, phBottom);
  vLine(xM, top, phBottom);
  vLine(xP1, top, phBottom);
  vLine(xR, top, phBottom);

  text("Phone (Office)", xL + PAD, centerY(top, phBottom), 9, true);
  if (data.phoneOffice)
    text(data.phoneOffice, xM + PAD, centerY(top, phBottom));

  text("IITP Email id", xP1 + PAD, centerY(top, phBottom), 9, true);
  if (data.iitpEmailId) {
    const emailX = xP1 + PAD + 65;
    text(data.iitpEmailId, emailX, centerY(top, phBottom));
  }

  top = phBottom;

  // Remaining rows
  top = drawRow("Personal Webpage", null, data.personalWebpage, top, 15);
  top = drawRow("Research Areas/Areas", "of Interest", data.researchAreas, top, 30);
  top = drawRow("Other Interests", null, data.otherInterests, top, 15);
  top = drawRow("Courses taught at IITP", null, data.coursesTaught, top, 15);
  top = drawRow("No. of PhD Students", null, data.noOfPhDStudents, top, 25);
  top = drawRow("Professional", "Experience", data.professionalExperience, top, 28);
  top = drawRow("Awards & Honours", null, data.awardsHonours, top, 15);
  top = drawRow("Member of Professional", "bodies", data.memberOfProfessionalBodies, top, 28);
  top = drawRow("Books", null, data.books, top, 28);
  top = drawRow("Publications", null, data.publications, top, 15);
  top = drawRow("Presentations", null, data.presentations, top, 28);
};

module.exports = { renderComputerCenterFacultyPerformaPdf };