const path = require("path");

const PDF_TEMPLATE_MAPPINGS = {
  "General Administration Self Declaration Form": {
    fileName:
      "general_administration_self_declaration_form__doc__pdf__1720505895.pdf",
    fields: {
      employeeName: { page: 0, x: 218, yTop: 171, maxWidth: 380, size: 11 },
      designation: { page: 0, x: 161, yTop: 194, maxWidth: 165, size: 11 },
      departmentSectionCentre: { page: 0, x: 420, yTop: 195, maxWidth: 175, size: 11 },
      signatureName: { page: 0, x: 369, yTop: 515, maxWidth: 225, size: 11 },
      employeeNumber: { page: 0, x: 369, yTop: 546, maxWidth: 225, size: 11 },
      place: { page: 0, x: 369, yTop: 572, maxWidth: 225, size: 11 },
      declarationDate: { page: 0, x: 369, yTop: 600, maxWidth: 225, size: 11 },
    },
  },
  "Medical Claim Form (OPD Treatment)": {
    fileName: "medical_medical_claim_form_for_opd_treatment_1726255699.pdf",
    fields: {
      claimantName: { page: 0, x: 205, yTop: 192 },
      designationAndEmpNo: { page: 0, x: 205, yTop: 214 },
      claimantDepartment: { page: 0, x: 205, yTop: 236 },
      pay: { page: 0, x: 205, yTop: 258 },
      specialPay: { page: 0, x: 205, yTop: 280 },
      residentialAddress: { page: 0, x: 205, yTop: 302 },
      patientNameRelationship: { page: 0, x: 265, yTop: 342 },
      illness: { page: 0, x: 205, yTop: 364 },
      illnessSinceAndPlace: { page: 0, x: 245, yTop: 386 },
      consultationDate: { page: 0, x: 205, yTop: 456 },
      consultationFee: { page: 0, x: 205, yTop: 478 },
      medicalOfficerName: { page: 0, x: 275, yTop: 499 },
      hospitalAttached: { page: 0, x: 205, yTop: 521 },
      consultedAt: { page: 0, x: 255, yTop: 543 },
      cashMemosCount: { page: 1, x: 205, yTop: 267 },
      totalAmountClaimed: { page: 1, x: 205, yTop: 287 },
      totalEnclosures: { page: 1, x: 205, yTop: 307 },
    },
    tableFields: {
      medicines: {
        page: 2,
        startX: 80,
        startYTop: 478,
        rowHeight: 14,
        columns: [
          { key: "Medicine Name", width: 300 },
          { key: "Price (Rs.)", width: 110 },
        ],
      },
    },
  },
};

const TEMPLATE_FOLDER_PATH = path.join(__dirname, "..", "assets", "pdf-templates");

module.exports = {
  PDF_TEMPLATE_MAPPINGS,
  TEMPLATE_FOLDER_PATH,
};
