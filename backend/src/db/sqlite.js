const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath =
  process.env.TEMPLATES_DB_PATH || path.join(__dirname, "..", "..", "data", "templates.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      return resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      return resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      return resolve(rows);
    });
  });
}

const ready = run(`
  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    operation TEXT NOT NULL,
    operand1 INTEGER NOT NULL,
    operand2 INTEGER NOT NULL,
    template_json TEXT NOT NULL,
    steps_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = {
  dbPath,
  run,
  get,
  all,
  ready
};
