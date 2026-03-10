const mongoose = require("mongoose");

const approvalLogSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["approved", "rejected"],
      required: true,
    },
    comment: {
      type: String,
      default: "",
    },
    actedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

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

    // Simple way to track history: all versions of a form
    // for a user share the same template + submittedBy and
    // differ only in version / timestamps. To support
    // "edit as new", the client can fetch a previous
    // submission and create a new one.
    parentSubmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormSubmission",
      default: null,
    },

    // Snapshot of the approval chain that applied at the time
    // of submission. This is copied from FormTemplate.approvalStages
    // when the submission is created.
    approvalStages: {
      type: [String],
      default: [],
    },

    // Index into approvalStages indicating whose turn it is.
    currentStageIndex: {
      type: Number,
      default: 0,
    },

    // Detailed log of approval / rejection actions.
    approvals: {
      type: [approvalLogSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormSubmission", formSubmissionSchema);
