const TemplateService = require("../services/template.service");
const TemplateRepository = require("../repositories/template.repository");

exports.createTemplate = async (req, res) => {
  try {
    const { template, steps } = TemplateService.generateTemplate(req.body);
    const id = await TemplateRepository.create({
      prompt: req.body.prompt,
      operation: req.body.operation,
      operand1: req.body.operand1,
      operand2: req.body.operand2,
      template,
      steps
    });

    return res.json({
      success: true,
      id,
      template,
      steps
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.previewTemplate = async (req, res) => {
  try {
    const { template, steps } = TemplateService.generateTemplate({
      ...req.body,
      missing: req.body.missing || []
    });

    return res.json({
      success: true,
      template,
      steps
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getStudentTemplate = async (req, res) => {
  try {
    const record = await TemplateRepository.getById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    const maskedTemplate = TemplateService.maskTemplate(record.template);

    return res.json({
      success: true,
      id: record.id,
      template: maskedTemplate
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.submitTemplateAnswers = async (req, res) => {
  try {
    const record = await TemplateRepository.getById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    const evaluation = TemplateService.evaluateAnswers(record.template, req.body.answers || []);

    if (evaluation.isCorrect) {
      return res.json({ success: true, isCorrect: true });
    }

    return res.json({
      success: true,
      isCorrect: false,
      correctTemplate: record.template,
      correctAnswer: record.template.result,
      steps: record.steps
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
