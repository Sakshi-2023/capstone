const FormTemplate = require("../models/FormTemplate");
const fs = require("fs");
const path = require("path");

const normalizeTemplate = (raw) => {
  const title = String(raw.title || "").trim();
  if (!title) throw new Error("Template title is required");

  const fields = Array.isArray(raw.fields) ? raw.fields : [];
  if (fields.length === 0) throw new Error(`Fields are required for template "${title}"`);

  return {
    title,
    description: String(raw.description || ""),
    fields: fields.map((f) => ({
      label: String(f.label || "").trim(),
      name: String(f.name || "").trim(),
      type: f.type || "text",
      required: Boolean(f.required),
      options: Array.isArray(f.options) ? f.options : [],
      columns: Array.isArray(f.columns) ? f.columns : [],
    })),
    approvalStages: Array.isArray(raw.approvalStages) ? raw.approvalStages : [],
  };
};

const upsertTemplatesForUser = async (userId, templates) => {
  const results = [];
  for (const raw of templates) {
    try {
      const normalized = normalizeTemplate(raw);
      const existing = await FormTemplate.findOne({
        title: normalized.title,
      });

      if (existing) {
        existing.description = normalized.description;
        existing.fields = normalized.fields;
        existing.approvalStages = normalized.approvalStages;
        await existing.save();
        results.push({ title: normalized.title, status: "updated", id: existing._id });
      } else {
        const created = await FormTemplate.create({
          ...normalized,
          createdBy: userId,
        });
        results.push({ title: normalized.title, status: "created", id: created._id });
      }
    } catch (err) {
      results.push({
        title: raw && raw.title ? String(raw.title) : "(unknown)",
        status: "failed",
        reason: err.message,
      });
    }
  }
  return results;
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

const loadBundledGenAdminTemplates = () => {
  const filePath = path.join(
    __dirname,
    "..",
    "config",
    "templates.gen-admin.sample.json"
  );
  const rawContent = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(rawContent);
  return Array.isArray(parsed.templates) ? parsed.templates : [];
};

// @desc Get all templates
const getAllTemplates = async (req, res) => {
  try {
    // Keep bundled gen-admin forms available to all users automatically.
    const bundledTemplates = loadBundledGenAdminTemplates();
    if (bundledTemplates.length > 0) {
      await upsertTemplatesForUser(req.user.id, bundledTemplates);
    }

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

// @desc Bulk import templates from JSON body
// Body: { templates: [ {title, description, fields, approvalStages}, ... ] }
const importTemplates = async (req, res) => {
  try {
    const templates = Array.isArray(req.body.templates) ? req.body.templates : [];
    if (templates.length === 0) {
      return res.status(400).json({ message: "templates array is required" });
    }

    const results = await upsertTemplatesForUser(req.user.id, templates);

    res.status(201).json({
      message: "Template import completed",
      total: results.length,
      created: results.filter((r) => r.status === "created").length,
      updated: results.filter((r) => r.status === "updated").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to import templates" });
  }
};

// @desc Import templates from bundled gen-admin JSON
const importGenAdminTemplates = async (req, res) => {
  try {
    const templates = loadBundledGenAdminTemplates();
    if (templates.length === 0) {
      return res.status(400).json({ message: "No templates found in bundled file" });
    }

    const results = await upsertTemplatesForUser(req.user.id, templates);
    res.status(201).json({
      message: "Gen-admin templates imported",
      total: results.length,
      created: results.filter((r) => r.status === "created").length,
      updated: results.filter((r) => r.status === "updated").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to import gen-admin templates" });
  }
};

module.exports = {
  createTemplate,
  getAllTemplates,
  getMyTemplates,
  importTemplates,
  importGenAdminTemplates,
};