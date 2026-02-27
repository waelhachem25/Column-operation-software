const { columnAdd } = require("../utils/columnAddition");
const { columnSubtract } = require("../utils/columnSubtraction");
const { columnMultiply } = require("../utils/columnMultiplication");
const { divideWithSteps } = require("../utils/division");
class MathService {
  static solve({ operand1, operand2, operation }) {
    switch (operation) {
      case "+":
        return this.add(operand1, operand2);

      case "-":
        return this.subtract(operand1, operand2);

      case "*":
        return this.multiply(operand1, operand2);

      case "/":
        return this.divide(operand1, operand2);

      default:
        throw new Error("Invalid operation");
    }
  }
  static add(a, b) {
    this.ensureNonNegativeIntegers(a, b, "Addition");
    return columnAdd(a, b); // returns { result, steps }
  }
  static subtract(a, b) {
  this.ensureNonNegativeIntegers(a, b, "Subtraction");
  return columnSubtract(a, b); // returns { result, steps }
}
  static multiply(a, b) {
  this.ensureNonNegativeIntegers(a, b, "Multiplication");
  return columnMultiply(a, b);
}

 static divide(a, b) {
  this.ensureNonNegativeIntegers(a, b, "Division");
  return divideWithSteps(a, b, { precision: 2 });
}

  static validate(studentAnswer, correctAnswer) {
    return Number(studentAnswer) === Number(correctAnswer);
  }
  static ensureNumbers(a, b, context = "Operation") {
    if (typeof a !== "number" || typeof b !== "number" || Number.isNaN(a) || Number.isNaN(b)) {
      throw new Error(`${context}: operands must be valid numbers`);
    }
  }

  static ensureNonNegativeIntegers(a, b, context = "Operation") {
    this.ensureNumbers(a, b, context);

    const isIntA = Number.isInteger(a);
    const isIntB = Number.isInteger(b);

    if (!isIntA || !isIntB) {
      throw new Error(`${context}: column method supports integers only`);
    }
    if (a < 0 || b < 0) {
      throw new Error(`${context}: column method supports non-negative integers only`);
    }
  }
}

module.exports = MathService;