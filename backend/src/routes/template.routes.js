const express = require("express");
const router = express.Router();

const {
  createTemplate,
  getStudentTemplate,
  previewTemplate,
  submitTemplateAnswers
} = require("../controllers/template.controller");
const {
  validateTemplatePreviewRequest,
  validateTemplateRequest,
  validateTemplateSubmitRequest
} = require("../validators/template.validator");

router.post("/preview", validateTemplatePreviewRequest, previewTemplate);
router.post("/", validateTemplateRequest, createTemplate);
router.get("/:id/student", getStudentTemplate);
router.post("/:id/submit", validateTemplateSubmitRequest, submitTemplateAnswers);

// Legacy compatibility
router.post("/template", validateTemplateRequest, createTemplate);

module.exports = router;
