const express = require("express");
const router = express.Router();

const { solveProblem } = require("../controllers/math.controller");
const { validateRequest } = require("../validators/math.validator");
const { createTemplate, previewTemplate } = require("../controllers/template.controller");
const { validateTemplateRequest, validateTemplatePreviewRequest } = require("../validators/template.validator");

router.post("/solve", validateRequest, solveProblem);
router.post("/template", validateTemplateRequest, createTemplate);
// legacy preview compatibility mounted under /api/math/template/preview
router.post("/template/preview", validateTemplatePreviewRequest, previewTemplate);

module.exports = router;
