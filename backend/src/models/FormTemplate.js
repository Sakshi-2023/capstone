const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "number", "date", "textarea", "select", "radio", "file", "email"],
    default: "text",
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: {
    type: [String],
    default: [],
  },
});

const formTemplateSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    fields: [fieldSchema],
    // Ordered list of roles that must approve this form.
    // Example: ["HOD", "Dean", "Director"] or ["HOD"] etc.
    approvalStages: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormTemplate", formTemplateSchema);