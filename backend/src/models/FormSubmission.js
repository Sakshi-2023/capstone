const mongoose = require("mongoose");

const formSubmissionSchema = new mongoose.Schema(
  {
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormTemplate",
      required: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    responses: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "submitted",
    },

    version: {
      type: Number,
      default: 1,
    },

    parentSubmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormSubmission",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormSubmission", formSubmissionSchema);
