const express = require("express");
const {
  createTemplate,
  getAllTemplates,
  getMyTemplates,
  getGenAdminTemplate,
  getGenAdminVehicleRequisitionTemplate,
  getSecurityCampusLeaveTemplate,
  getSecurityRequisitionForVehicleStickerTemplate,
  getSecurityVehicleStickerRequitionForMarriedScholarTemplate,
  getSecurityUndertakingRegardingWorkerConductAndResponsibilityTemplate,
  getComputerCenterLdapAccountRequestTemplate,
 getEstbDepartureRejoiningTemplate,
  getFinanceProcurementRecommendationSanctionTemplate,
  getComputerCenterFacultyPerformaTemplate,
  getComputerCenterFacultyDeclarationTemplate,
  getComputerCenterEmailAccountRequestTemplate,
  getComputerCenterProxyLdapRequestTemplate,
} = require("../controllers/formController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create template
router.post("/templates", protect, createTemplate);

// Get all templates
router.get("/templates", protect, getAllTemplates);

// Get my templates
router.get("/templates/me", protect, getMyTemplates);

// Hardcoded General Administration Self Declaration template
router.get("/general-administration-self-declaration/template", protect, getGenAdminTemplate);

// Hardcoded General Administration Vehicle Requisition template
router.get(
  "/general-administration-vehicle-requisition-transport/template",
  protect,
  getGenAdminVehicleRequisitionTemplate
);

// Security – Campus Leaving Permission after 10:00 PM (For Female Students)
router.get("/security-campus-leave-permission-female/template", protect, getSecurityCampusLeaveTemplate);

// Security - Requisition for Vehicle Sticker
router.get(
  "/security_requisition_for_vehicle_sticker/template",
  protect,
  getSecurityRequisitionForVehicleStickerTemplate
);

// Security – Requisition for Vehicle Sticker (Resident of Married Accommodation Only)
router.get(
  "/security-vehicle-sticker-requition-for-married-scholar/template",
  protect,
  getSecurityVehicleStickerRequitionForMarriedScholarTemplate
);

// Security - Undertaking regarding worker conduct and responsibility
router.get(
  "/security_undertaking_regarding_worker_conduct_and_responsibility/template",
  protect,
  getSecurityUndertakingRegardingWorkerConductAndResponsibilityTemplate
);

// Computer Center – REQUEST / REQUISITION FORM (For LDAP Account)
router.get("/computer-center-ldap-account-request/template", protect, getComputerCenterLdapAccountRequestTemplate);
router.get("/estb-departure-rejoining-report/template", protect, getEstbDepartureRejoiningTemplate);

// Finance - Recommendation cum Sanction Sheet for Purchase (Double Bid Tendering - INR)
router.get(
  "/finance-procurement-recommendation-sanction-double-bid-inr/template",
  protect,
  getFinanceProcurementRecommendationSanctionTemplate
);

// Computer Center - Faculty Performa Form
router.get("/computer-center-faculty-performa/template", protect, getComputerCenterFacultyPerformaTemplate);

// Computer Center - Faculty Declaration Form
router.get("/computer-center-faculty-declaration/template", protect, getComputerCenterFacultyDeclarationTemplate);

// Computer Center - Email Account Request Form
router.get("/computer-center-email-account-request/template", protect, getComputerCenterEmailAccountRequestTemplate);

// Computer Center - Proxy LDAP Request Form
router.get("/computer-center-proxy-ldap-request/template", protect, getComputerCenterProxyLdapRequestTemplate);

module.exports = router;