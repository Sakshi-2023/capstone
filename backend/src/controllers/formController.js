const FormTemplate = require("../models/FormTemplate");

const GEN_ADMIN_TEMPLATE_CODE = "gen-admin";
const SECURITY_CAMPUS_LEAVE_FEMALE_CODE = "security-campus-leave-female";
const CC_LDAP_ACCOUNT_REQUEST_CODE = "cc-ldap-account-request";

const SECURITY_CAMPUS_LEAVE_FEMALE_TEMPLATE = {
  code: SECURITY_CAMPUS_LEAVE_FEMALE_CODE,
  title: "Campus Leaving Permission after 10:00 PM (For Female Students)",
  description: "Permission form for female students leaving IIT Patna campus after 10:00 PM.",
  section: "security",
  fields: [
    { label: "Name", name: "name", type: "text", required: true },
    { label: "Roll No", name: "rollNo", type: "text", required: true },
    { label: "Hostel Name", name: "hostelName", type: "text", required: true },
    { label: "Gender", name: "gender", type: "text", required: false },
    { label: "Date of Leaving", name: "dateOfLeaving", type: "date", required: true },
    { label: "Reason for Leaving", name: "reasonForLeaving", type: "textarea", required: true },
    { label: "Companion 1 Name", name: "companion1Name", type: "text", required: false },
    { label: "Companion 1 Roll No", name: "companion1RollNo", type: "text", required: false },
    { label: "Companion 2 Name", name: "companion2Name", type: "text", required: false },
    { label: "Companion 2 Roll No", name: "companion2RollNo", type: "text", required: false },
  ],
  approvalStages: [],
};

const CC_LDAP_ACCOUNT_REQUEST_TEMPLATE = {
  code: CC_LDAP_ACCOUNT_REQUEST_CODE,
  title: "REQUEST / REQUISITION FORM (For LDAP Account)",
  description: "Computer Center request/requisition form for LDAP account creation (project staff/temporary staff).",
  section: "cc",
  fields: [
    { label: "Emp. ID/Project ID", name: "empIdProjectId", type: "text", required: true },
    { label: "Full Name", name: "fullName", type: "text", required: true },
    { label: "Dept./Section/Centre", name: "department", type: "text", required: true },
    { label: "Phone/Mobile No.", name: "phoneMobileNo", type: "text", required: true },
    { label: "Personal Email-ID", name: "personalEmailId", type: "text", required: true },
    { label: "Address", name: "address", type: "textarea", required: true },
    { label: "IITP Email id (If any)", name: "iitpEmailId", type: "text", required: false },
    { label: "Validity date / Last Date for LDAP account", name: "validityLastDate", type: "date", required: true },
    { label: "Date", name: "requestDate", type: "date", required: true },
  ],
  approvalStages: [],
};

const getGenAdminTemplate = async (req, res) => {
  try {
    let template = await FormTemplate.findOne({ code: GEN_ADMIN_TEMPLATE_CODE });

    if (!template) {
      template = await FormTemplate.create({
        code: GEN_ADMIN_TEMPLATE_CODE,
        title: "General Administration Self-Declaration",
        description: "A self-declaration form for general administration purposes.",
        fields: [
          { label: "Salutation", name: "salutation", type: "select", required: true, options: ["Dr.", "Mr.", "Ms."] },
          { label: "Full Name", name: "fullName", type: "text", required: true },
          { label: "Designation", name: "designation", type: "text", required: true },
          { label: "Dept./Section/Centre", name: "department", type: "text", required: true },
          { label: "Employee Signature Name", name: "employeeSignatureName", type: "text", required: true },
          { label: "Employee Number", name: "empNo", type: "text", required: true },
          { label: "Place", name: "place", type: "text", required: true },
          { label: "Date", name: "declarationDate", type: "date", required: true },
        ],
        approvalStages: [],
        createdBy: req.user.id,
      });
    }

    return res.json(template);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load general administration self declaration template" });
  }
};

const getSecurityCampusLeaveTemplate = async (req, res) => {
  try {
    let template = await FormTemplate.findOne({ code: SECURITY_CAMPUS_LEAVE_FEMALE_CODE });

    if (!template) {
      template = await FormTemplate.create({
        ...SECURITY_CAMPUS_LEAVE_FEMALE_TEMPLATE,
        createdBy: req.user.id,
      });
    }

    return res.json(template);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load security campus leave template" });
  }
};

const getComputerCenterLdapAccountRequestTemplate = async (req, res) => {
  try {
    let template = await FormTemplate.findOne({ code: CC_LDAP_ACCOUNT_REQUEST_CODE });

    if (!template) {
      template = await FormTemplate.create({
        ...CC_LDAP_ACCOUNT_REQUEST_TEMPLATE,
        createdBy: req.user.id,
      });
    }

    return res.json(template);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load computer center LDAP account request template" });
  }
};

// @desc Create new form template
const createTemplate = async (req, res) => {
  try {
    const { title, description, fields, approvalStages } = req.body;

    if (!title || !fields || fields.length === 0) {
      return res.status(400).json({ message: "Title and fields required" });
    }

    const template = await FormTemplate.create({
      title,
      description,
      fields,
      approvalStages: Array.isArray(approvalStages) ? approvalStages : [],
      createdBy: req.user.id,
    });

    res.status(201).json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create template" });
  }
};

// @desc Get all templates
const getAllTemplates = async (req, res) => {
  try {
    // Ensure Gen Admin template exists
    let genAdminTemplate = await FormTemplate.findOne({ code: GEN_ADMIN_TEMPLATE_CODE });
    if (!genAdminTemplate) {
      genAdminTemplate = await FormTemplate.create({
        code: GEN_ADMIN_TEMPLATE_CODE,
        title: "General Administration Self-Declaration",
        description: "A self-declaration form for general administration purposes.",
        fields: [
          { label: "Salutation", name: "salutation", type: "select", required: true, options: ["Dr.", "Mr.", "Ms."] },
          { label: "Full Name", name: "fullName", type: "text", required: true },
          { label: "Designation", name: "designation", type: "text", required: true },
          { label: "Dept./Section/Centre", name: "department", type: "text", required: true },
          { label: "Employee Signature Name", name: "employeeSignatureName", type: "text", required: true },
          { label: "Employee Number", name: "empNo", type: "text", required: true },
          { label: "Place", name: "place", type: "text", required: true },
          { label: "Date", name: "declarationDate", type: "date", required: true },
        ],
        approvalStages: [],
        createdBy: req.user?.id || null,
      });
    }

    // Ensure Security Campus Leave (Female) template exists
    let securityCampusLeaveTemplate = await FormTemplate.findOne({ code: SECURITY_CAMPUS_LEAVE_FEMALE_CODE });
    if (!securityCampusLeaveTemplate) {
      await FormTemplate.create({
        ...SECURITY_CAMPUS_LEAVE_FEMALE_TEMPLATE,
        createdBy: req.user?.id || null,
      });
    }

    // Ensure Computer Center LDAP account request template exists
    let ccLdapTemplate = await FormTemplate.findOne({ code: CC_LDAP_ACCOUNT_REQUEST_CODE });
    if (!ccLdapTemplate) {
      await FormTemplate.create({
        ...CC_LDAP_ACCOUNT_REQUEST_TEMPLATE,
        createdBy: req.user?.id || null,
      });
    }

    const templates = await FormTemplate.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch templates" });
  }
};

// @desc Get templates created by current user
const getMyTemplates = async (req, res) => {
  try {
    const templates = await FormTemplate.find({
      createdBy: req.user.id, // changed here
    }).sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user templates" });
  }
};

module.exports = {
  createTemplate,
  getAllTemplates,
  getMyTemplates,
  getGenAdminTemplate,
  getSecurityCampusLeaveTemplate,
  getComputerCenterLdapAccountRequestTemplate,
};