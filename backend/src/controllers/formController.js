const FormTemplate = require("../models/FormTemplate");

const GEN_ADMIN_TEMPLATE_CODE = "gen-admin";

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
};