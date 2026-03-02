const FormSubmission = require("../models/FormSubmission");
const FormTemplate = require("../models/FormTemplate");

// @desc Submit a form
const submitForm = async (req, res) => {
  try {
    const { templateId, responses } = req.body;

    if (!templateId || !responses) {
      return res.status(400).json({ message: "Template and responses required" });
    }

    // Ensure template exists
    const template = await FormTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const submission = await FormSubmission.create({
      template: templateId,
      submittedBy: req.user.id,
      responses,
      status: "submitted",
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit form" });
  }
};

// @desc Get my submissions
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await FormSubmission.find({
      submittedBy: req.user.id,
    })
      .populate("template", "title description")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

module.exports = {
  submitForm,
  getMySubmissions,
};