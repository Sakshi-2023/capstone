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

    // ── Photo upload ──────────────────────────────────────────────
    photo: {
      data: { type: Buffer, default: null },
      contentType: { type: String, default: null },
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

    approvalStages: {
      type: [String],
      default: [],
    },

    currentStageIndex: {
      type: Number,
      default: 0,
    },

    approvals: {
      type: [approvalLogSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormSubmission", formSubmissionSchema);