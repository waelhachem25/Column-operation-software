const MathService = require("./math.service");

const ALLOWED_ROWS = ["top", "bottom", "result", "partial"];

function multiplyPartials(a, b) {
  const topDigits = String(a).split("").map(Number);
  const bottomDigits = String(b).split("").map(Number);
  const partials = [];

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

    const shiftZeros = bottomDigits.length - 1 - j;
    const shifted = [...line, ...Array(shiftZeros).fill(0)];
    const partialStr = String(Number(shifted.join("")));
    partials.push(partialStr);
  }

  return partials;
}

function cellKey(cell) {
  if (cell.row === "partial") {
    return `${cell.row}:${cell.partialIndex}:${cell.indexFromRight}`;
  }
  return `${cell.row}::${cell.indexFromRight}`;
}

function sortMissing(a, b) {
  const rowRank = { top: 0, bottom: 1, partial: 2, result: 3 };
  const byRow = rowRank[a.row] - rowRank[b.row];
  if (byRow !== 0) return byRow;

  const byPartial = (a.partialIndex ?? -1) - (b.partialIndex ?? -1);
  if (byPartial !== 0) return byPartial;

  return a.indexFromRight - b.indexFromRight;
}

function replaceCharAt(str, index, replacement) {
  return str.substring(0, index) + replacement + str.substring(index + 1);
}

class TemplateService {
  static normalizeMissing(missing = []) {
    if (!Array.isArray(missing)) {
      throw new Error("missing must be an array");
    }

    const seen = new Set();
    const normalized = [];

    for (const m of missing) {
      if (!m || typeof m !== "object") {
        throw new Error("Each missing entry must be an object");
      }
      if (!ALLOWED_ROWS.includes(m.row)) {
        throw new Error("missing.row must be one of: top, bottom, result, partial");
      }
      if (!Number.isInteger(m.indexFromRight) || m.indexFromRight < 0) {
        throw new Error("missing.indexFromRight must be a non-negative integer");
      }

      if (m.row === "partial" && (!Number.isInteger(m.partialIndex) || m.partialIndex < 0)) {
        throw new Error("missing.partialIndex must be a non-negative integer when row='partial'");
      }

      const cell = {
        row: m.row,
        indexFromRight: m.indexFromRight
      };
      if (m.row === "partial") {
        cell.partialIndex = m.partialIndex;
      }

      const key = cellKey(cell);
      if (seen.has(key)) continue;
      seen.add(key);
      normalized.push(cell);
    }

    normalized.sort(sortMissing);
    return normalized;
  }

  static getRowValue(template, cell) {
    if (cell.row === "top") return template.top;
    if (cell.row === "bottom") return template.bottom;
    if (cell.row === "result") return template.result;
    if (cell.row === "partial") {
      if (!Number.isInteger(cell.partialIndex) || cell.partialIndex < 0 || cell.partialIndex >= template.partials.length) {
        throw new Error("missing.partialIndex is out of range");
      }
      return template.partials[cell.partialIndex];
    }
    throw new Error("Invalid row");
  }

  static setRowValue(template, cell, rowValue) {
    if (cell.row === "top") {
      template.top = rowValue;
      return;
    }
    if (cell.row === "bottom") {
      template.bottom = rowValue;
      return;
    }
    if (cell.row === "result") {
      template.result = rowValue;
      return;
    }
    if (cell.row === "partial") {
      template.partials[cell.partialIndex] = rowValue;
      return;
    }
    throw new Error("Invalid row");
  }

  static validateMissingCells(missing, template) {
    for (const cell of missing) {
      const rowValue = this.getRowValue(template, cell);
      const targetIndex = rowValue.length - 1 - cell.indexFromRight;

      if (targetIndex < 0 || targetIndex >= rowValue.length) {
        throw new Error(`missing cell out of range for row='${cell.row}'`);
      }
    }
  }

  static getCellChar(template, cell) {
    const rowValue = this.getRowValue(template, cell);
    const targetIndex = rowValue.length - 1 - cell.indexFromRight;
    return rowValue[targetIndex];
  }

  static maskTemplate(template) {
    const masked = {
      ...template,
      partials: [...template.partials],
      missing: [...template.missing]
    };

    for (const cell of masked.missing) {
      const rowValue = this.getRowValue(masked, cell);
      const targetIndex = rowValue.length - 1 - cell.indexFromRight;
      const hidden = replaceCharAt(rowValue, targetIndex, "□");
      this.setRowValue(masked, cell, hidden);
    }

    return masked;
  }

  static normalizeAnswers(answers = []) {
    if (!Array.isArray(answers)) {
      throw new Error("answers must be an array");
    }

    const seen = new Set();
    const normalized = [];

    for (const answer of answers) {
      if (!answer || typeof answer !== "object") {
        throw new Error("Each answer entry must be an object");
      }
      if (!ALLOWED_ROWS.includes(answer.row)) {
        throw new Error("answers.row must be one of: top, bottom, result, partial");
      }
      if (!Number.isInteger(answer.indexFromRight) || answer.indexFromRight < 0) {
        throw new Error("answers.indexFromRight must be a non-negative integer");
      }
      if (answer.row === "partial" && (!Number.isInteger(answer.partialIndex) || answer.partialIndex < 0)) {
        throw new Error("answers.partialIndex must be a non-negative integer when row='partial'");
      }

      const value = String(answer.value ?? "");
      if (!/^[0-9.]$/.test(value)) {
        throw new Error("answers.value must be a single character: 0-9 or '.'");
      }

      const normalizedAnswer = {
        row: answer.row,
        indexFromRight: answer.indexFromRight,
        value
      };
      if (answer.row === "partial") {
        normalizedAnswer.partialIndex = answer.partialIndex;
      }

      const key = cellKey(normalizedAnswer);
      if (seen.has(key)) {
        throw new Error("answers contains duplicate cells");
      }
      seen.add(key);
      normalized.push(normalizedAnswer);
    }

    normalized.sort(sortMissing);
    return normalized;
  }

  static evaluateAnswers(template, answers) {
    const normalizedAnswers = this.normalizeAnswers(answers);
    const expectedMissing = this.normalizeMissing(template.missing || []);

    if (normalizedAnswers.length !== expectedMissing.length) {
      throw new Error("answers must include exactly one value for each missing cell");
    }

    const answerMap = new Map(normalizedAnswers.map((a) => [cellKey(a), a.value]));

    for (const cell of expectedMissing) {
      const key = cellKey(cell);
      if (!answerMap.has(key)) {
        throw new Error("answers does not match required missing cells");
      }

      const expected = this.getCellChar(template, cell);
      if (answerMap.get(key) !== expected) {
        return { isCorrect: false };
      }
    }

    return { isCorrect: true };
  }

  static generateTemplate(problem) {
    const { prompt, operation, operand1, operand2, missing = [], override } = problem;
    const solution = MathService.solve({ operand1, operand2, operation });

    const finalResult = override?.result !== undefined ? String(override.result) : String(solution.result);
    const finalSteps = override?.steps !== undefined ? override.steps : solution.steps;

    const template = {
      prompt,
      operation,
      top: String(operand1),
      bottom: String(operand2),
      partials: operation === "*" ? multiplyPartials(operand1, operand2) : [],
      result: finalResult,
      missing: []
    };

    const normalizedMissing = this.normalizeMissing(missing);
    this.validateMissingCells(normalizedMissing, template);
    template.missing = normalizedMissing;

    return { template, steps: finalSteps };
  }
}

module.exports = TemplateService;
