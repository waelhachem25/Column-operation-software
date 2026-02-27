
const MathService = require("../services/math.service");

exports.solveProblem = (req, res) => {
  try {
    const { operand1, operand2, operation, studentAnswer } = req.body;

    const solution = MathService.solve({ operand1, operand2, operation });
    const isCorrect = MathService.validate(studentAnswer, solution.result);

    if (isCorrect) {
      return res.json({ success: true, isCorrect: true });
    }

    return res.json({
      success: true,
      isCorrect: false,
      correctAnswer: solution.result,
      steps: solution.steps
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};