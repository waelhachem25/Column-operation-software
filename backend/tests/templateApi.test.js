const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const testDbPath = path.join(
  os.tmpdir(),
  `column-templates-${Date.now()}-${Math.random().toString(16).slice(2)}.db`
);

process.env.TEMPLATES_DB_PATH = testDbPath;

const app = require("../src/app");

describe("Template API", () => {
  afterAll(() => {
    try {
      if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    } catch (e) {
      // no-op
    }
  });

  test("create -> student view -> submit correct and wrong answers", async () => {
    const createPayload = {
      prompt: "Fill all missing values",
      operation: "*",
      operand1: 12,
      operand2: 34,
      missing: [
        { row: "top", indexFromRight: 1 },
        { row: "bottom", indexFromRight: 0 },
        { row: "partial", partialIndex: 0, indexFromRight: 1 },
        { row: "result", indexFromRight: 2 }
      ]
    };

    const created = await request(app).post("/api/templates").send(createPayload);
    expect(created.status).toBe(200);
    expect(created.body.success).toBe(true);
    expect(typeof created.body.id).toBe("string");
    expect(created.body.id.length).toBeGreaterThan(10);

    const templateId = created.body.id;

    const studentView = await request(app).get(`/api/templates/${templateId}/student`);
    expect(studentView.status).toBe(200);
    expect(studentView.body.success).toBe(true);
    expect(studentView.body.id).toBe(templateId);
    expect(studentView.body.steps).toBeUndefined();
    expect(studentView.body.template.top).toBe("□2");
    expect(studentView.body.template.bottom).toBe("3□");
    expect(studentView.body.template.partials[0]).toBe("□8");
    expect(studentView.body.template.result).toBe("□08");

    const correctSubmit = await request(app)
      .post(`/api/templates/${templateId}/submit`)
      .send({
        answers: [
          { row: "top", indexFromRight: 1, value: "1" },
          { row: "bottom", indexFromRight: 0, value: "4" },
          { row: "partial", partialIndex: 0, indexFromRight: 1, value: "4" },
          { row: "result", indexFromRight: 2, value: "4" }
        ]
      });

    expect(correctSubmit.status).toBe(200);
    expect(correctSubmit.body.success).toBe(true);
    expect(correctSubmit.body.isCorrect).toBe(true);

    const wrongSubmit = await request(app)
      .post(`/api/templates/${templateId}/submit`)
      .send({
        answers: [
          { row: "top", indexFromRight: 1, value: "9" },
          { row: "bottom", indexFromRight: 0, value: "4" },
          { row: "partial", partialIndex: 0, indexFromRight: 1, value: "4" },
          { row: "result", indexFromRight: 2, value: "4" }
        ]
      });

    expect(wrongSubmit.status).toBe(200);
    expect(wrongSubmit.body.success).toBe(true);
    expect(wrongSubmit.body.isCorrect).toBe(false);
    expect(wrongSubmit.body.correctAnswer).toBe("408");
    expect(Array.isArray(wrongSubmit.body.steps)).toBe(true);
    expect(wrongSubmit.body.correctTemplate.top).toBe("12");
  });

  test("rejects invalid missing schemas", async () => {
    const invalidRow = await request(app).post("/api/templates").send({
      prompt: "Bad",
      operation: "+",
      operand1: 10,
      operand2: 1,
      missing: [{ row: "unknown", indexFromRight: 0 }]
    });

    expect(invalidRow.status).toBe(400);
    expect(invalidRow.body.success).toBe(false);

    const missingPartialIndex = await request(app).post("/api/templates").send({
      prompt: "Bad",
      operation: "*",
      operand1: 10,
      operand2: 1,
      missing: [{ row: "partial", indexFromRight: 0 }]
    });

    expect(missingPartialIndex.status).toBe(400);
    expect(missingPartialIndex.body.success).toBe(false);

    const outOfRange = await request(app).post("/api/templates").send({
      prompt: "Bad",
      operation: "+",
      operand1: 10,
      operand2: 1,
      missing: [{ row: "result", indexFromRight: 9 }]
    });

    expect(outOfRange.status).toBe(400);
    expect(outOfRange.body.success).toBe(false);
  });

  test("math solve accepts decimal student answers for division", async () => {
    const res = await request(app).post("/api/math/solve").send({
      operand1: 10,
      operand2: 4,
      operation: "/",
      studentAnswer: 2.5
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isCorrect).toBe(true);
  });

  test("legacy /api/math/template endpoint still works", async () => {
    const res = await request(app).post("/api/math/template").send({
      prompt: "Legacy",
      operation: "+",
      operand1: 1,
      operand2: 2,
      missing: [{ row: "result", indexFromRight: 0 }]
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.id).toBe("string");
    expect(res.body.template.result).toBe("3");
  });
});
