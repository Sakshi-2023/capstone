const { getResponseValue, formatDate } = require("../../utils/pdfUtils");
const pdfStyles = require("../../utils/pdfStyles");

const renderComputerCenterFacultyPerformaPdf = (doc, submission) => {
  const responses = submission.responses;

  const name = String(getResponseValue(responses, "name") || "").trim();
  const designation = String(getResponseValue(responses, "designation") || "").trim();
  const department = String(getResponseValue(responses, "department") || "").trim();
  const highestAcademicQualification = String(getResponseValue(responses, "highestAcademicQualification") || "").trim();
  const phoneOffice = String(getResponseValue(responses, "phoneOffice") || "").trim();
  const iitpEmailId = String(getResponseValue(responses, "iitpEmailId") || "").trim();
  const personalWebpage = String(getResponseValue(responses, "personalWebpage") || "").trim();
  const researchAreas = String(getResponseValue(responses, "researchAreas") || "").trim();
  const otherInterests = String(getResponseValue(responses, "otherInterests") || "").trim();
  const coursesTaught = String(getResponseValue(responses, "coursesTaught") || "").trim();
  const noOfPhDStudents = String(getResponseValue(responses, "noOfPhDStudents") || "").trim();
  const professionalExperience = String(getResponseValue(responses, "professionalExperience") || "").trim();
  const awardsHonours = String(getResponseValue(responses, "awardsHonours") || "").trim();
  const memberOfProfessionalBodies = String(getResponseValue(responses, "memberOfProfessionalBodies") || "").trim();
  const books = String(getResponseValue(responses, "books") || "").trim();
  const publications = String(getResponseValue(responses, "publications") || "").trim();
  const presentations = String(getResponseValue(responses, "presentations") || "").trim();

  const leftMargin = doc.page.margins.left;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const underlineField = (label, value, lineStartX, lineEndX) => {
    const rowY = doc.y;
    const lineY = rowY + 14;

    doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text(label, leftMargin, rowY);
    doc
      .moveTo(lineStartX, lineY)
      .lineTo(lineEndX, lineY)
      .lineWidth(0.5)
      .stroke();

    if (value) {
      doc.font("Helvetica").fontSize(pdfStyles.getFontSize('BODY')).text(value, lineStartX + 3, rowY, {
        width: lineEndX - lineStartX - 6,
        ellipsis: true,
      });
    }

    doc.y = rowY + 24;
  };

  // ── Header ──────────────────────────────────────────────────────────────────
  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize('TITLE'))
    .text("Performa for Faculty Home Page", { align: "center" });

  doc.moveDown(0.5);

  // ── Form Fields ─────────────────────────────────────────────────────────────
  underlineField("Name", name, leftMargin + 150, leftMargin + 400);
  
  doc.font("Helvetica").fontSize(pdfStyles.getFontSize('BODY')).text("Photograph / send through email", leftMargin + 420, doc.y - 20);
  
  underlineField("Designation", designation, leftMargin, leftMargin + 300);
  underlineField("Department", department, leftMargin, leftMargin + 300);
  underlineField("Highest Academic Qualification", highestAcademicQualification, leftMargin, leftMargin + 400);
  
  doc.y += 10;
  underlineField("Phone (Office)", phoneOffice, leftMargin, leftMargin + 200);
  underlineField("IITP Email id", iitpEmailId, leftMargin + 250, leftMargin + 500);
  underlineField("Personal Webpage", personalWebpage, leftMargin, leftMargin + 400);
  
  doc.y += 10;
  underlineField("Research Areas/Areas of Interest", researchAreas, leftMargin, leftMargin + 450);
  underlineField("Other Interests", otherInterests, leftMargin, leftMargin + 400);
  underlineField("Courses taught at IITP", coursesTaught, leftMargin, leftMargin + 450);
  underlineField("No. of PhD Students", noOfPhDStudents, leftMargin, leftMargin + 200);
  underlineField("Professional Experience", professionalExperience, leftMargin, leftMargin + 450);
  underlineField("Awards & Honours", awardsHonours, leftMargin, leftMargin + 450);
  underlineField("Member of Professional bodies", memberOfProfessionalBodies, leftMargin, leftMargin + 450);
  underlineField("Books", books, leftMargin, leftMargin + 450);
  underlineField("Publications", publications, leftMargin, leftMargin + 450);
  underlineField("Presentations", presentations, leftMargin, leftMargin + 450);
};

module.exports = { renderComputerCenterFacultyPerformaPdf };
