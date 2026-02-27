// backend/src/utils/columnMultiplication.js

const { columnAdd } = require("./columnAddition");

function columnMultiply(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error("columnMultiply supports integers only");
  }
  if (a < 0 || b < 0) {
    throw new Error("columnMultiply supports non-negative integers only");
  }

  // Quick exits
  if (a === 0 || b === 0) {
    return { result: 0, steps: ["Any number multiplied by 0 equals 0."] };
  }

  const topDigits = String(a).split("").map(Number);
  const bottomDigits = String(b).split("").map(Number);

  const steps = [];
  const partials = [];

  // Multiply top by each digit of bottom (right to left)
  for (let j = bottomDigits.length - 1; j >= 0; j--) {
    const digitB = bottomDigits[j];
    let carry = 0;
    const line = [];

    for (let i = topDigits.length - 1; i >= 0; i--) {
      const digitA = topDigits[i];
      const prod = digitA * digitB + carry;
      line.unshift(prod % 10);
      carry = Math.floor(prod / 10);
    }

    if (carry > 0) line.unshift(carry);

    // shift by zeros depending on position from right
    const shiftZeros = bottomDigits.length - 1 - j;
    const shifted = [...line, ...Array(shiftZeros).fill(0)];

    const partialValue = Number(shifted.join(""));
    partials.push(partialValue);

    steps.push(
      `Multiply ${a} by ${digitB} (place shift: ${shiftZeros}) → partial = ${partialValue}`
    );
  }

  // Sum partials using columnAdd for consistency and step correctness
  let sum = 0;
  for (const p of partials) {
    const addRes = columnAdd(sum, p);
    sum = addRes.result;
  }

  steps.push(`Sum partial products: ${partials.join(" + ")} = ${sum}`);

  return { result: sum, steps };
}

module.exports = { columnMultiply };