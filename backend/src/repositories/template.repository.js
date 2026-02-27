const { randomUUID } = require("crypto");
const { get, run, ready } = require("../db/sqlite");

class TemplateRepository {
  static async create({ prompt, operation, operand1, operand2, template, steps }) {
    await ready;

    const id = randomUUID();

    await run(
      `INSERT INTO templates (id, prompt, operation, operand1, operand2, template_json, steps_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        prompt,
        operation,
        operand1,
        operand2,
        JSON.stringify(template),
        JSON.stringify(steps || [])
      ]
    );

    return id;
  }

  static async getById(id) {
    await ready;

    const row = await get(`SELECT * FROM templates WHERE id = ?`, [id]);
    if (!row) return null;

    return {
      id: row.id,
      prompt: row.prompt,
      operation: row.operation,
      operand1: row.operand1,
      operand2: row.operand2,
      template: JSON.parse(row.template_json),
      steps: JSON.parse(row.steps_json),
      createdAt: row.created_at
    };
  }
}

module.exports = TemplateRepository;
