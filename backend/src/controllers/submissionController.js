const FormSubmission = require("../models/FormSubmission");
const FormTemplate = require("../models/FormTemplate");
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const { PDFDocument: PDFLibDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const {
  PDF_PAGE_SETTINGS,
  PDF_HEADER_SETTINGS,
} = require("../config/pdfSettings");
const {
  PDF_TEMPLATE_MAPPINGS,
  TEMPLATE_FOLDER_PATH,
} = require("../config/pdfTemplateMappings");

const getSubmissionValue = (responses, key) => {
  if (!responses) return undefined;
  if (typeof responses.get === "function") return responses.get(key);
  return responses[key];
};

const renderPdfHeader = (doc) => {
  const startY = doc.y;
  if (fs.existsSync(PDF_HEADER_SETTINGS.logoPath)) {
    doc.image(PDF_HEADER_SETTINGS.logoPath, PDF_PAGE_SETTINGS.leftMargin, startY, {
      width: PDF_HEADER_SETTINGS.logoWidth,
    });
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .text(PDF_HEADER_SETTINGS.instituteNameEnglish, PDF_PAGE_SETTINGS.leftMargin + 62, startY, {
      width: doc.page.width - PDF_PAGE_SETTINGS.leftMargin - PDF_PAGE_SETTINGS.rightMargin - 62,
      align: "left",
    });

  const hindiFontAvailable = fs.existsSync(PDF_HEADER_SETTINGS.hindiFontPath);
  if (hindiFontAvailable) {
    doc.registerFont(
      PDF_HEADER_SETTINGS.hindiFontName,
      PDF_HEADER_SETTINGS.hindiFontPath
    );
  }

  doc
    .font(hindiFontAvailable ? PDF_HEADER_SETTINGS.hindiFontName : "Helvetica")
    .fontSize(12)
    .text(PDF_HEADER_SETTINGS.instituteNameHindi, PDF_PAGE_SETTINGS.leftMargin + 62, doc.y + 2, {
      width: doc.page.width - PDF_PAGE_SETTINGS.leftMargin - PDF_PAGE_SETTINGS.rightMargin - 62,
      align: "left",
    });

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(PDF_HEADER_SETTINGS.subtitle, PDF_PAGE_SETTINGS.leftMargin + 62, doc.y + 2);

  doc.y = Math.max(doc.y + 6, startY + 56);
  doc
    .moveTo(PDF_PAGE_SETTINGS.leftMargin, doc.y)
    .lineTo(doc.page.width - PDF_PAGE_SETTINGS.rightMargin, doc.y)
    .stroke();
  doc.moveDown(0.8);
};

const renderTableField = (doc, fieldLabel, columns, rows) => {
  doc.font("Helvetica-Bold").fontSize(13).text(fieldLabel);
  doc.moveDown(0.25);

  const safeColumns = Array.isArray(columns) && columns.length > 0 ? columns : ["Column 1"];
  const safeRows = Array.isArray(rows) ? rows : [];

  doc.font("Helvetica-Bold").fontSize(10).text(safeColumns.join(" | "));
  doc.moveDown(0.2);
  doc.font("Helvetica").fontSize(9);

  if (safeRows.length === 0) {
    doc.text("-");
    doc.moveDown(0.4);
    return;
  }

  safeRows.forEach((row, idx) => {
    const rendered = safeColumns.map((col) => (row && row[col] ? String(row[col]) : "-"));
    doc.text(`${idx + 1}. ${rendered.join(" | ")}`);
  });
  doc.moveDown(0.5);
};

const fitTextToWidth = (text, font, size, maxWidth) => {
  if (!maxWidth) return text;
  let output = String(text);
  while (output.length > 0 && font.widthOfTextAtSize(output, size) > maxWidth) {
    output = output.slice(0, -1);
  }
  return output;
};

const drawPdfLibText = (page, text, x, y, options = {}) => {
  if (!text) return;
  const size = options.size || 9;
  const font = options.font;
  const maxWidth = options.maxWidth;
  const renderedText =
    font && maxWidth ? fitTextToWidth(String(text), font, size, maxWidth) : String(text);
  page.drawText(renderedText, {
    x,
    y,
    size,
    color: rgb(0, 0, 0),
    maxWidth,
  });
};

const yFromTop = (pageHeight, yTop, fontSize = 11) => {
  return pageHeight - yTop;
};

const generateOriginalTemplatePdf = async (submission) => {
  const templateTitle = submission?.template?.title;
  if (!templateTitle || !PDF_TEMPLATE_MAPPINGS[templateTitle]) return null;

  const mapping = PDF_TEMPLATE_MAPPINGS[templateTitle];
  const templatePath = path.join(TEMPLATE_FOLDER_PATH, mapping.fileName);
  if (!fs.existsSync(templatePath)) return null;

  const sourceBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFLibDocument.load(sourceBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  Object.entries(mapping.fields || {}).forEach(([key, meta]) => {
    const page = pages[meta.page];
    if (!page) return;
    const pageHeight = page.getHeight();
    const value = getSubmissionValue(submission.responses, key);
    if (value === undefined || value === null || value === "") return;

    page.setFont(font);
    const y = yFromTop(pageHeight, meta.yTop, meta.size);

    drawPdfLibText(
      page,
      String(value),
      meta.x,
      yFromTop(pageHeight, meta.yTop, meta.size),
      {
        size: meta.size || 11,
        maxWidth: meta.maxWidth,
        font,
      }
    );
  });

  Object.entries(mapping.tableFields || {}).forEach(([key, tableMeta]) => {
    const page = pages[tableMeta.page];
    if (!page) return;
    const pageHeight = page.getHeight();
    const rows = getSubmissionValue(submission.responses, key);
    if (!Array.isArray(rows)) return;

    rows.slice(0, 10).forEach((row, rowIndex) => {
      let currentX = tableMeta.startX;
      tableMeta.columns.forEach((col) => {
        const cellValue = row && row[col.key] ? String(row[col.key]) : "";
        page.setFont(font);
        drawPdfLibText(
          page,
          cellValue,
          currentX,
          yFromTop(pageHeight, tableMeta.startYTop + rowIndex * tableMeta.rowHeight),
          { size: 8, maxWidth: col.width - 4, font }
        );
        currentX += col.width;
      });
    });
  });

  const filledBytes = await pdfDoc.save();
  return Buffer.from(filledBytes);
};

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
      .populate("template", "title description approvalStages")
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
      .populate("template", "title fields")
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

    const originalTemplatePdf = await generateOriginalTemplatePdf(submission);
    if (originalTemplatePdf) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=form-${submission._id}.pdf`
      );
      return res.send(originalTemplatePdf);
    }

    const doc = new PDFDocument({
      size: "A4",
      margins: {
        left: PDF_PAGE_SETTINGS.leftMargin,
        right: PDF_PAGE_SETTINGS.rightMargin,
        top: PDF_PAGE_SETTINGS.topMargin,
        bottom: PDF_PAGE_SETTINGS.bottomMargin,
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=form-${submission._id}.pdf`
    );

    doc.pipe(res);

    renderPdfHeader(doc);

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
      const value = getSubmissionValue(submission.responses, field.name);
      if (field.type === "table") {
        renderTableField(doc, field.label, field.columns, value);
        return;
      }
      doc
        .font("Helvetica-Bold")
        .text(`${field.label}: `, { continued: true });
      doc.font("Helvetica").text(
        value !== undefined && value !== null ? String(value) : "-"
      );
      doc.moveDown(0.3);
    });

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