const { columnAdd } = require("../src/utils/columnAddition");
const { columnSubtract } = require("../src/utils/columnSubtraction");
const { columnMultiply } = require("../src/utils/columnMultiplication");
const { divideWithSteps } = require("../src/utils/division");
describe("Column Operations", () => {
  test("columnAdd: 123 + 45 = 168", () => {
    const { result, steps } = columnAdd(123, 45);
    expect(result).toBe(168);
    expect(steps.length).toBeGreaterThan(0);
  });

  test("columnAdd handles carry: 95 + 17 = 112", () => {
    const { result, steps } = columnAdd(95, 17);
    expect(result).toBe(112);
    expect(steps.some(s => s.includes("carry"))).toBe(true);
  });

  test("columnSubtract: 503 - 278 = 225", () => {
    const { result, steps } = columnSubtract(503, 278);
    expect(result).toBe(225);
    expect(steps.length).toBeGreaterThan(0);
  });

  test("columnSubtract handles borrow: 1000 - 1 = 999", () => {
    const { result, steps } = columnSubtract(1000, 1);
    expect(result).toBe(999);
    expect(steps.some(s => s.toLowerCase().includes("borrow"))).toBe(true);
  });
  test("columnMultiply: 12 * 34 = 408", () => {
    const { result, steps } = columnMultiply(12, 34);
    expect(result).toBe(408);
    expect(steps.length).toBeGreaterThan(0);
  });

  test("columnMultiply: 105 * 7 = 735", () => {
    const { result } = columnMultiply(105, 7);
    expect(result).toBe(735);
  });
  test("divide exact: 144 / 12 = 12", () => {
    const { result, remainder } = divideWithSteps(144, 12);
    expect(result).toBe(12);
    expect(remainder).toBe(0);
});

test("divide non-exact: 10 / 4 = 2.50", () => {
  const { result, remainder } = divideWithSteps(10, 4, { precision: 2 });
  expect(result).toBe(2.5); // JS number (2.50 becomes 2.5)
  expect(remainder).toBe(2);
});
});