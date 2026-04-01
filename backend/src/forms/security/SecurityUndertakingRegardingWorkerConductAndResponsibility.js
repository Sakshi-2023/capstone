const { getResponseValue } = require("../../utils/pdfUtils");
const pdfStyles = require("../../utils/pdfStyles");

const renderSecurityUndertakingRegardingWorkerConductAndResponsibilityPdf = (doc, submission) => {
  const responses = submission.responses || {};

  const name = String(getResponseValue(responses, "name") || "").trim();
  const designation = String(getResponseValue(responses, "designation") || "").trim();
  const firmName = String(getResponseValue(responses, "firmName") || "").trim();
  const mobileNo = String(getResponseValue(responses, "mobileNo") || "").trim();
  const emailId = String(getResponseValue(responses, "emailId") || "").trim();

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const pageWidth = right - left;

  const bodySize = pdfStyles.getFontSize("BODY");
  const sectionHeaderSize = pdfStyles.getFontSize("SECTION_HEADER");
  const smallSize = pdfStyles.getFontSize("SMALL");

  const writeParagraph = (text, options = {}) => {
    doc
      .font("Helvetica")
      .fontSize(bodySize)
      .text(text, left, doc.y, {
        width: pageWidth,
        align: options.align || "justify",
        lineGap: options.lineGap ?? 2,
      });

    doc.moveDown(options.gap ?? 0.8);
  };

  doc
    .font("Helvetica-Bold")
    .fontSize(pdfStyles.getFontSize("TITLE"))
    .text("UNDERTAKING REGARDING WORKER CONDUCT AND RESPONSIBILITY", {
      align: "center",
      underline: true,
    });

  doc.moveDown(1);

  doc
    .font("Helvetica")
    .fontSize(bodySize)
    .text("To,\nThe Dean (Students Affairs)\nIIT Patna", left, doc.y, {
      lineGap: 1,
    });

  doc.moveDown(0.9);

  doc
    .font("Helvetica-Bold")
    .fontSize(sectionHeaderSize)
    .text(
      "Subject: Undertaking regarding the Conduct & Responsibility of Mess Workers",
      left,
      doc.y,
      { width: pageWidth }
    );

  doc.moveDown(0.9);

  doc.font("Helvetica").fontSize(bodySize).text("Dear Sir/Madam,");
  doc.moveDown(0.9);

  writeParagraph(
    "The workers employed for food preparation, service, and other related tasks are staying within the campus premises and interacting with students and hostel employees of the campus."
  );

  writeParagraph(
    "I undertake the responsibility to ensure the smooth functioning of the campus environment and the safety of the students and to maintain proper conduct among all mess workers. As the mess contractor, I am responsible for the behavior, antecedents, and general conduct of my employees."
  );

  doc
    .font("Helvetica")
    .fontSize(bodySize)
    .text("Further, I undertake the following:-", left, doc.y, {
      width: pageWidth,
    });

  doc.moveDown(0.7);

  const undertakingItems = [
    "I affirm that all the mess workers employed have been thoroughly vetted with respect to their personal background, criminal record, and antecedents, and that they have been found to be of good character.",
    "I take full responsibility for the conduct of all workers while they are within the campus premises and ensure that they do not engage in any inappropriate activities or interactions with students or other residents.",
    "In case any worker is found to be involved in any misconduct, I will take immediate corrective action, including disciplinary measures, and will cooperate fully with the campus authorities for any investigation or resolution required.",
    "I agree to ensure that my mess workers will adhere to all the rules and regulations set forth by IIT Patna, including those related to campus security, interaction with students, and behavior while on duty.",
    "I will provide a copy of their photo ID proof, photograph, and a list of all current workers to the campus security and ensure that this information is kept up to date at all times.",
  ];

  undertakingItems.forEach((item, index) => {
    const itemY = doc.y;

    doc.font("Helvetica").fontSize(bodySize).text(`${index + 1}.`, left + 2, itemY);
    doc
      .font("Helvetica")
      .fontSize(bodySize)
      .text(item, left + 24, itemY, {
        width: pageWidth - 24,
        align: "justify",
        lineGap: 2,
      });

    doc.moveDown(0.45);
  });

  writeParagraph("I am thankful to the IIT Patna Administration for their cooperation.", {
    align: "left",
    gap: 0.8,
  });

  doc.font("Helvetica").fontSize(bodySize).text("Best regards,", left, doc.y);

  doc.moveDown(1.4);

  const bottomY = doc.y;
  const stampCenterX = left + 70;
  const stampCenterY = bottomY + 58;
  const stampRadius = 50;

  doc
    .circle(stampCenterX, stampCenterY, stampRadius)
    .lineWidth(1.5)
    .strokeColor("#214f93")
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(sectionHeaderSize)
    .fillColor("#d77b2a")
    .text("Stamp of\nthe Firm", stampCenterX - 26, stampCenterY - 15, {
      width: 52,
      align: "center",
      lineGap: 2,
    })
    .fillColor("black");

  doc.strokeColor("black");

  const detailsX = left + pageWidth * 0.56;
  const detailsStartY = bottomY + 8;
  const details = [
    { label: "Signature", value: "" },
    { label: "Name", value: name },
    { label: "Designation", value: designation },
    { label: "Firm's Name", value: firmName },
    { label: "Mobile No.", value: mobileNo },
    { label: "Email id", value: emailId },
  ];

  const labelWidth = 100;
  const valueWidth = right - detailsX - labelWidth;
  let detailsY = detailsStartY;

  details.forEach((entry) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(sectionHeaderSize)
      .text(`${entry.label}:`, detailsX, detailsY, {
        width: labelWidth,
      });

    doc
      .font("Helvetica")
      .fontSize(bodySize)
      .text(entry.value || "", detailsX + labelWidth, detailsY + 1, {
        width: valueWidth,
      });

    detailsY += 24;
  });

  doc.y = Math.max(stampCenterY + stampRadius + 12, detailsY + 6);
  doc.font("Helvetica").fontSize(smallSize);
};

module.exports = { renderSecurityUndertakingRegardingWorkerConductAndResponsibilityPdf };
