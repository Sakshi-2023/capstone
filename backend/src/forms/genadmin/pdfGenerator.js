const { getResponseValue, formatDate } = require("../../utils/pdfUtils");
const pdfStyles = require("../../utils/pdfStyles");

const renderGenAdminPdf = (doc, submission) => {
  const responses = submission.responses;
  const salutation = String(getResponseValue(responses, "salutation") || "").trim();
  const fullName = String(getResponseValue(responses, "fullName") || "").trim();
  const designation = String(getResponseValue(responses, "designation") || "").trim();
  const department = String(getResponseValue(responses, "department") || "").trim();
  const employeeSignatureName = String(getResponseValue(responses, "employeeSignatureName") || "").trim();
  const empNo = String(getResponseValue(responses, "empNo") || "").trim();
  const place = String(getResponseValue(responses, "place") || "").trim();
  const declarationDate = formatDate(getResponseValue(responses, "declarationDate"));

  pdfStyles.applyDeclarationHeader(doc, "DECLARATION");

  doc
    .font("Helvetica")
    .fontSize(pdfStyles.getFontSize('BODY'))
    .text(`I, ${salutation} ${fullName},`);
  doc.text(`Designation ${designation}   Dept./Section/Centre ${department},`);
  doc.text("IIT Patna declare that there is nothing adverse against me in the Police record either");
  doc.text("criminally or politically, which would render me un-suitable for employment under the");
  doc.text("Govt. of India / IIT Patna.");

  doc.moveDown(1.2);
  doc.text("I, solemnly affirm that the above declaration is true and I understand that furnishing");
  doc.text("of false information or suppression of any factual information, which come to notice of the");
  doc.text("authorities of the Institute at any time during my service would be a disqualification and I");
  doc.text("shall be liable to be dismissed from the service of the Institute.");

  doc.moveDown(3.5);

  const drawWidth = 220;
  const rightX = doc.page.width - doc.page.margins.right - drawWidth;
  
  pdfStyles.applySignatureBlock(
    doc,
    "SIGNATURE OF THE EMPLOYEE",
    employeeSignatureName,
    empNo,
    place,
    declarationDate,
    rightX,
    drawWidth
  );

  doc.moveDown(1.2);
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("To", doc.page.margins.left, doc.y);
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("The Director", doc.page.margins.left + 32, doc.y + 2);
  doc.font("Helvetica-Bold").fontSize(pdfStyles.getFontSize('LABEL')).text("IIT Patna", doc.page.margins.left + 32, doc.y + 2);
};

module.exports = { renderGenAdminPdf };
