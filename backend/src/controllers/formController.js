const FormTemplate = require("../models/FormTemplate");

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
    const templates = await FormTemplate.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
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
};