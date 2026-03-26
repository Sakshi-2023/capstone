const FormSubmission = require("../models/FormSubmission");
const FormTemplate = require("../models/FormTemplate");
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const { renderGenAdminPdf } = require("../forms/genadmin/pdfGenerator");
const { renderSecurityCampusLeavePermissionForFemaleStudentsPdf } = require("../forms/security/SecurityCampusLeavePermissionForFemaleStudents");
const { renderComputerCenterRequestingLdapAccountPdf } = require("../forms/cc/ComputerCenterRequestingLdapAccountCreationOfProjectStaffTemporaryStaff");
const { getResponseValue } = require("../utils/pdfUtils");

const GEN_ADMIN_TEMPLATE_CODE = "gen-admin";
const SECURITY_CAMPUS_LEAVE_FEMALE_CODE = "security-campus-leave-female";
const CC_LDAP_ACCOUNT_REQUEST_CODE = "cc-ldap-account-request";

// @desc Submit a form
// Body: { templateId, responses, parentSubmissionId? }
const submitForm = async (req, res) => {
  try {
    const { templateId, responses, parentSubmissionId } = req.body;

    if (!templateId || !responses) {
      return res
        .status(400)
        .json({ message: "Template and responses required" });
    }

    // Ensure template exists
    const template = await FormTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    let version = 1;
    let parentSubmission = null;

    if (parentSubmissionId) {
      const parent = await FormSubmission.findOne({
        _id: parentSubmissionId,
        submittedBy: req.user.id,
      });

      if (!parent) {
        return res
          .status(404)
          .json({ message: "Parent submission not found for this user" });
      }

      version = (parent.version || 1) + 1;
      parentSubmission = parent._id;
    }

    const submission = await FormSubmission.create({
      template: templateId,
      submittedBy: req.user.id,
      responses,
      status: "submitted",
      version,
      parentSubmission,
      approvalStages: template.approvalStages || [],
      currentStageIndex: 0,
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit form" });
  }
};

// @desc Get my submissions (history)
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await FormSubmission.find({
      submittedBy: req.user.id,
    })
      .populate("template", "title description approvalStages code")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

// @desc Get a single submission (for viewing / edit-as-new)
const getSubmissionById = async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.id)
      .populate("template", "title description fields approvalStages")
      .populate("submittedBy", "name email role")
      .populate("approvals.user", "name email role");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Allow owner or any higher-level role to view
    const isOwner =
      submission.submittedBy &&
      submission.submittedBy._id.toString() === req.user.id;

    const privilegedRoles = ["Admin", "HOD", "Dean", "Director"];
    const isPrivileged =
      req.user.role && privilegedRoles.includes(String(req.user.role));

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: "Not authorized to view" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submission" });
  }
};

// @desc List submissions pending approval for current user
const getPendingApprovals = async (req, res) => {
  try {
    const role = req.user.role;
    if (!role) {
      return res
        .status(400)
        .json({ message: "User does not have a role assigned" });
    }

    const submissions = await FormSubmission.find({
      status: "submitted",
      approvalStages: { $in: [role] },
      $expr: {
        $eq: [
          { $arrayElemAt: ["$approvalStages", "$currentStageIndex"] },
          role,
        ],
      },
    })
      .populate("template", "title description")
      .populate("submittedBy", "name email role");

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch pending approvals" });
  }
};

// @desc Approve or reject a submission
// Body: { action: "approved" | "rejected", comment? }
const actOnSubmission = async (req, res) => {
  try {
    const { action, comment } = req.body;
    const role = req.user.role;

    if (!["approved", "rejected"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const submission = await FormSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.status !== "submitted") {
      return res
        .status(400)
        .json({ message: "Submission is not pending approval" });
    }

    const stages = submission.approvalStages || [];
    const currentRole = stages[submission.currentStageIndex] || null;

    if (!currentRole || currentRole !== role) {
      return res.status(403).json({
        message:
          "You are not the current approver for this submission",
      });
    }

    submission.approvals.push({
      role,
      user: req.user.id,
      action,
      comment: comment || "",
    });

    if (action === "rejected") {
      submission.status = "rejected";
    } else {
      // Move to next stage or mark approved
      if (submission.currentStageIndex + 1 >= stages.length) {
        submission.status = "approved";
      } else {
        submission.currentStageIndex += 1;
      }
    }

    await submission.save();

    res.json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update submission" });
  }
};

// @desc Generate PDF for a submission
const generateSubmissionPDF = async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.id)
      .populate("template", "title fields code")
      .populate("submittedBy", "name email role");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const isOwner =
      submission.submittedBy &&
      submission.submittedBy._id.toString() === req.user.id;
    const privilegedRoles = ["Admin", "HOD", "Dean", "Director"];
    const isPrivileged =
      req.user.role && privilegedRoles.includes(String(req.user.role));

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: "Not authorized to download" });
    }

    const templateCode = submission.template?.code || "";
    const isGenAdmin = templateCode === GEN_ADMIN_TEMPLATE_CODE;
    const isSecurityCampusLeaveFemale = templateCode === SECURITY_CAMPUS_LEAVE_FEMALE_CODE;
    const isComputerCenterLdapRequest = templateCode === CC_LDAP_ACCOUNT_REQUEST_CODE;
    const doc = new PDFDocument({ margin: isGenAdmin ? 70 : 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=form-${submission._id}.pdf`
    );

    doc.pipe(res);

    if (isGenAdmin) {
      renderGenAdminPdf(doc, submission);
    } else if (isSecurityCampusLeaveFemale) {
      renderSecurityCampusLeavePermissionForFemaleStudentsPdf(doc, submission);
    } else if (isComputerCenterLdapRequest) {
      renderComputerCenterRequestingLdapAccountPdf(doc, submission);
    } else {
      // Header (logo placeholder + institute title)
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("Indian Institute of Technology Patna", { align: "center" });
      doc
        .fontSize(12)
        .font("Helvetica")
        .text("Online Forms Portal", { align: "center" });
      doc.moveDown(0.5);
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke();
      doc.moveDown(1);

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(submission.template.title || "Form Submission", {
          align: "center",
        });
      doc.moveDown();

      doc.fontSize(10).font("Helvetica");
      doc.text(`Submitted by: ${submission.submittedBy.name}`);
      doc.text(`Email: ${submission.submittedBy.email}`);
      doc.text(`Role: ${submission.submittedBy.role}`);
      doc.text(`Submitted at: ${submission.createdAt.toLocaleString()}`);
      doc.text(`Status: ${submission.status}`);
      doc.moveDown();

      doc.fontSize(12).font("Helvetica-Bold").text("Responses", { underline: true });
      doc.moveDown(0.5);

      const fields = submission.template.fields || [];
      fields.forEach((field) => {
        const value = getResponseValue(submission.responses, field.name);
        doc
          .font("Helvetica-Bold")
          .text(`${field.label}: `, { continued: true });
        doc.font("Helvetica").text(
          value !== undefined && value !== null && String(value).trim() !== ""
            ? String(value)
            : "-"
        );
        doc.moveDown(0.3);
      });
    }

    if (submission.approvals && submission.approvals.length > 0) {
      doc.moveDown();
      doc.fontSize(12).text("Approval History", { underline: true });
      doc.moveDown(0.5);

      submission.approvals.forEach((log) => {
        doc
          .font("Helvetica-Bold")
          .text(
            `${log.role} - ${log.action.toUpperCase()} on ${new Date(
              log.actedAt
            ).toLocaleString()}`
          );
        if (log.comment) {
          doc
            .font("Helvetica")
            .text(`Comment: ${log.comment}`, { indent: 10 });
        }
        doc.moveDown(0.4);
      });
    }

    doc.end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to generate submission PDF" });
  }
};

module.exports = {
  submitForm,
  getMySubmissions,
  getSubmissionById,
  getPendingApprovals,
  actOnSubmission,
  generateSubmissionPDF,
};