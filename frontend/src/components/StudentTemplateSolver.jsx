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

export default function StudentTemplateSolver({ templateId, template }) {
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");
  const [result, setResult] = useState(null);

  const missingCells = useMemo(
    () => [...(template?.missing || [])].sort(sortCells),
    [template]
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

      <ColumnWorksheet
        template={template}
        editableCells={missingCells}
        cellInputs={inputs}
        onCellInputChange={onChange}
      />

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
