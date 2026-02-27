// backend/src/utils/division.js

function divideWithSteps(a, b, options = { precision: 2 }) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error("Division supports integers only");
  }
  if (a < 0 || b < 0) {
    throw new Error("Division supports non-negative integers only");
  }
  if (b === 0) {
    throw new Error("Division by zero");
  }

  const steps = [];
  const quotient = Math.floor(a / b);
  const remainder = a % b;

  steps.push(`${a} ÷ ${b}`);
  steps.push(`Quotient = ${quotient}`);
  steps.push(`Remainder = ${remainder}`);

  if (remainder === 0) {
    steps.push(`Exact division → Answer = ${quotient}`);
    return { result: quotient, steps, quotient, remainder };
  }

  const precision = Number.isInteger(options.precision) ? options.precision : 2;
  const decimalResult = Number((a / b).toFixed(precision));

  steps.push(
    `Not exact → convert to decimal: ${a}/${b} ≈ ${decimalResult} (rounded to ${precision} dp)`
  );

  return { result: decimalResult, steps, quotient, remainder };
}

module.exports = { divideWithSteps };