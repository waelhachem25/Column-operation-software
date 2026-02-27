const ALLOWED_OPERATIONS = ["+", "-", "*", "/"];
const ALLOWED_ROWS = ["top", "bottom", "result", "partial"];

function validateCoreTemplateRequest(req, res) {
  const { prompt, operation, operand1, operand2, override } = req.body;

  const isValidInt = (v) => typeof v === "number" && Number.isInteger(v) && v >= 0;

  if (typeof prompt !== "string" || !prompt.trim()) {
    res.status(400).json({ success: false, message: "prompt must be a non-empty string" });
    return false;
  }

  if (!ALLOWED_OPERATIONS.includes(operation)) {
    res.status(400).json({ success: false, message: "Invalid operation" });
    return false;
  }

  if (!isValidInt(operand1) || !isValidInt(operand2)) {
    res.status(400).json({
      success: false,
      message: "operand1 and operand2 must be non-negative integers"
    });
    return false;
  }

  if (operation === "/" && operand2 === 0) {
    res.status(400).json({ success: false, message: "Division by zero is not allowed" });
    return false;
  }

  if (override !== undefined) {
    if (typeof override !== "object" || override === null || Array.isArray(override)) {
      res.status(400).json({ success: false, message: "override must be an object" });
      return false;
    }

    if (override.result !== undefined && typeof override.result !== "string") {
      res.status(400).json({ success: false, message: "override.result must be a string" });
      return false;
    }

    if (override.steps !== undefined) {
      if (!Array.isArray(override.steps) || !override.steps.every((s) => typeof s === "string")) {
        res.status(400).json({
          success: false,
          message: "override.steps must be an array of strings"
        });
        return false;
      }
    }
  }

  return true;
}

function validateMissingSchema(missing, { required }) {
  if (!Array.isArray(missing)) {
    return "missing must be an array";
  }

  if (required && missing.length === 0) {
    return "Select at least one missing cell";
  }

  for (const m of missing) {
    if (!m || typeof m !== "object") {
      return "Each missing entry must be an object";
    }
    if (!ALLOWED_ROWS.includes(m.row)) {
      return "missing.row must be one of: top, bottom, result, partial";
    }
    if (m.row === "partial" && (!Number.isInteger(m.partialIndex) || m.partialIndex < 0)) {
      return "missing.partialIndex must be a non-negative integer when row='partial'";
    }
    if (typeof m.indexFromRight !== "number" || !Number.isInteger(m.indexFromRight) || m.indexFromRight < 0) {
      return "missing.indexFromRight must be a non-negative integer";
    }
  }

  return null;
}

exports.validateTemplateRequest = (req, res, next) => {
  if (!validateCoreTemplateRequest(req, res)) return;

  const error = validateMissingSchema(req.body.missing, { required: true });
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  next();
};

exports.validateTemplatePreviewRequest = (req, res, next) => {
  if (!validateCoreTemplateRequest(req, res)) return;

  const missing = req.body.missing ?? [];
  const error = validateMissingSchema(missing, { required: false });
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  req.body.missing = missing;
  next();
};

exports.validateTemplateSubmitRequest = (req, res, next) => {
  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ success: false, message: "answers must be a non-empty array" });
  }

  for (const answer of answers) {
    if (!answer || typeof answer !== "object") {
      return res.status(400).json({ success: false, message: "Each answer must be an object" });
    }
    if (!ALLOWED_ROWS.includes(answer.row)) {
      return res.status(400).json({ success: false, message: "answers.row must be one of: top, bottom, result, partial" });
    }
    if (answer.row === "partial" && (!Number.isInteger(answer.partialIndex) || answer.partialIndex < 0)) {
      return res.status(400).json({
        success: false,
        message: "answers.partialIndex must be a non-negative integer when row='partial'"
      });
    }
    if (!Number.isInteger(answer.indexFromRight) || answer.indexFromRight < 0) {
      return res.status(400).json({
        success: false,
        message: "answers.indexFromRight must be a non-negative integer"
      });
    }
    if (typeof answer.value !== "string" || !/^[0-9.]$/.test(answer.value)) {
      return res.status(400).json({
        success: false,
        message: "answers.value must be one character: 0-9 or '.'"
      });
    }
  }

  next();
};
