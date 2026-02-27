const ALLOWED_OPERATIONS = ["+", "-", "*", "/"];

exports.validateRequest = (req, res, next) => {
  const { operand1, operand2, operation, studentAnswer } = req.body;

  const isValidNumber = (v) => typeof v === "number" && Number.isFinite(v);

  if (!isValidNumber(operand1) || !isValidNumber(operand2) || !isValidNumber(studentAnswer)) {
    return res.status(400).json({
      success: false,
      message: "operand1, operand2, and studentAnswer must be valid numbers"
    });
  }

  if (!Number.isInteger(operand1) || !Number.isInteger(operand2)) {
    return res.status(400).json({
      success: false,
      message: "operand1 and operand2 must be integers"
    });
  }

  if (operand1 < 0 || operand2 < 0) {
    return res.status(400).json({
      success: false,
      message: "Only non-negative integers are supported"
    });
  }

  if (!ALLOWED_OPERATIONS.includes(operation)) {
    return res.status(400).json({
      success: false,
      message: "Invalid operation"
    });
  }

  if (operation !== "/" && !Number.isInteger(studentAnswer)) {
    return res.status(400).json({
      success: false,
      message: "studentAnswer must be an integer for +, -, and *"
    });
  }

  if (operation === "/" && studentAnswer < 0) {
    return res.status(400).json({
      success: false,
      message: "studentAnswer must be non-negative"
    });
  }

  if (operation === "/" && operand2 === 0) {
    return res.status(400).json({
      success: false,
      message: "Division by zero is not allowed"
    });
  }

  next();
};
