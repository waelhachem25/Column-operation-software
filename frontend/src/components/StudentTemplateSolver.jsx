import React, { useMemo, useState } from "react";
import { submitTemplateAnswers } from "../services/api";
import ColumnWorksheet from "./ColumnWorksheet";

function cellKey(cell) {
  if (cell.row === "partial") {
    return `${cell.row}:${cell.partialIndex}:${cell.indexFromRight}`;
  }
  return `${cell.row}::${cell.indexFromRight}`;
}

function sortCells(a, b) {
  const rowRank = { top: 0, bottom: 1, partial: 2, result: 3 };
  const byRow = rowRank[a.row] - rowRank[b.row];
  if (byRow !== 0) return byRow;
  const byPartial = (a.partialIndex ?? -1) - (b.partialIndex ?? -1);
  if (byPartial !== 0) return byPartial;
  return b.indexFromRight - a.indexFromRight;
}

function getRowValue(template, cell) {
  if (cell.row === "top") return template.top;
  if (cell.row === "bottom") return template.bottom;
  if (cell.row === "result") return template.result;
  return template.partials[cell.partialIndex];
}

function setRowValue(template, cell, rowValue) {
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
  template.partials[cell.partialIndex] = rowValue;
}

function replaceCharAt(str, index, char) {
  return str.substring(0, index) + char + str.substring(index + 1);
}

function applyInputs(template, cells, inputs) {
  const result = {
    ...template,
    partials: [...(template.partials || [])],
    missing: [...(template.missing || [])]
  };

  for (const cell of cells) {
    const value = inputs[cellKey(cell)];
    if (!value) continue;

    const rowValue = getRowValue(result, cell);
    const index = rowValue.length - 1 - cell.indexFromRight;
    if (index < 0 || index >= rowValue.length) continue;
    setRowValue(result, cell, replaceCharAt(rowValue, index, value));
  }

  return result;
}

function groupLabel(cell) {
  if (cell.row === "top") return "Top row";
  if (cell.row === "bottom") return "Bottom row";
  if (cell.row === "result") return "Result row";
  return `Partial row ${cell.partialIndex + 1}`;
}

function groupMissingCells(cells) {
  const groups = new Map();

  for (const cell of cells) {
    const key = cell.row === "partial" ? `partial:${cell.partialIndex}` : cell.row;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(cell);
  }

  return [...groups.entries()].map(([key, groupCells]) => ({
    key,
    label: groupLabel(groupCells[0]),
    cells: groupCells.sort(sortCells)
  }));
}

export default function StudentTemplateSolver({ templateId, template }) {
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");
  const [result, setResult] = useState(null);

  const missingCells = useMemo(
    () => [...(template?.missing || [])].sort(sortCells),
    [template]
  );
  const groupedMissing = useMemo(() => groupMissingCells(missingCells), [missingCells]);

  const studentTemplate = useMemo(
    () => applyInputs(template, missingCells, inputs),
    [template, missingCells, inputs]
  );

  const onChange = (cell, rawValue) => {
    const cleaned = rawValue.replace(/[^0-9.]/g, "");
    const value = cleaned ? cleaned[cleaned.length - 1] : "";
    setInputs((prev) => ({ ...prev, [cellKey(cell)]: value }));
  };

  const reset = () => {
    setInputs({});
    setHint("");
    setResult(null);
  };

  const submit = async () => {
    setHint("");
    setResult(null);

    for (const cell of missingCells) {
      if (!inputs[cellKey(cell)]) {
        setHint("Please fill all empty boxes before submitting.");
        return;
      }
    }

    const answers = missingCells.map((cell) => {
      const answer = {
        row: cell.row,
        indexFromRight: cell.indexFromRight,
        value: inputs[cellKey(cell)]
      };
      if (cell.row === "partial") {
        answer.partialIndex = cell.partialIndex;
      }
      return answer;
    });

    try {
      setLoading(true);
      const res = await submitTemplateAnswers(templateId, { answers });
      setResult(res);
    } catch (e) {
      setHint(e?.response?.data?.message || "Failed to submit answer.");
    } finally {
      setLoading(false);
    }
  };

  if (!template) return null;

  return (
    <div className="panel">
      <span className="soft-chip">Student Worksheet</span>
      <h3 style={{ margin: "10px 0 12px" }}>{template.prompt || "Fill in the missing number:"}</h3>

      <ColumnWorksheet template={studentTemplate} />

      <div className="answer-groups">
        {groupedMissing.map((group) => (
          <div key={group.key} className="answer-group">
            <div className="answer-label">{group.label}</div>
            <div className="answer-strip">
              {group.cells.map((cell) => (
                <label key={cellKey(cell)} className="answer-slot">
                  <input
                    value={inputs[cellKey(cell)] ?? ""}
                    onChange={(e) => onChange(cell, e.target.value)}
                    inputMode="text"
                    maxLength={1}
                    aria-label={`${group.label} box ${cell.indexFromRight + 1} from right`}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="inline-actions">
        <button className="btn btn-primary" onClick={submit} disabled={loading}>
          {loading ? "Checking..." : "Submit"}
        </button>
        <button className="btn btn-secondary" onClick={reset} type="button" disabled={loading}>
          Try again
        </button>
      </div>

      {hint && <div className="status-bad">{hint}</div>}
      {result?.isCorrect === true && <div className="status-good">Correct</div>}

      {result?.isCorrect === false && (
        <div className="status-bad">
          <div style={{ fontWeight: 800 }}>False</div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700 }}>Correct Answer:</div>
            <div style={{ fontFamily: "Space Grotesk, monospace", fontSize: "1.25rem" }}>
              {result.correctAnswer}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Correct filled template:</div>
            <ColumnWorksheet template={result.correctTemplate} compact />
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700 }}>Explanation steps:</div>
            <ol style={{ marginTop: 6 }}>
              {(result.steps || []).map((s, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
