import React, { useMemo, useState } from "react";
import { createTemplate, previewTemplate } from "../services/api";
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

function getAllCells(template) {
  const cells = [];
  const pushRow = (row, value, partialIndex) => {
    for (let leftIndex = 0; leftIndex < value.length; leftIndex++) {
      const indexFromRight = value.length - 1 - leftIndex;
      const cell = { row, indexFromRight };
      if (row === "partial") cell.partialIndex = partialIndex;
      cells.push(cell);
    }
  };

  pushRow("top", template.top);
  pushRow("bottom", template.bottom);
  template.partials.forEach((partial, index) => pushRow("partial", partial, index));
  pushRow("result", template.result);

  return cells.sort(sortCells);
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

function replaceCharAt(str, index, replacement) {
  return str.substring(0, index) + replacement + str.substring(index + 1);
}

function maskTemplate(template, selectedSet) {
  const masked = { ...template, partials: [...template.partials], missing: [...template.missing] };

  for (const cell of getAllCells(template)) {
    if (!selectedSet.has(cellKey(cell))) continue;
    const rowValue = getRowValue(masked, cell);
    const idx = rowValue.length - 1 - cell.indexFromRight;
    setRowValue(masked, cell, replaceCharAt(rowValue, idx, "□"));
  }

  return masked;
}

function groupByRow(cells) {
  const groups = {
    top: [],
    bottom: [],
    partials: {},
    result: []
  };

  for (const cell of cells) {
    if (cell.row === "partial") {
      if (!groups.partials[cell.partialIndex]) groups.partials[cell.partialIndex] = [];
      groups.partials[cell.partialIndex].push(cell);
      continue;
    }
    groups[cell.row].push(cell);
  }

  return groups;
}

function rowTitle(cell) {
  if (cell.row === "top") return "Top row";
  if (cell.row === "bottom") return "Bottom row";
  if (cell.row === "result") return "Result row";
  return `Partial row ${cell.partialIndex + 1}`;
}

function placeValueLabel(indexFromRight) {
  const labels = [
    "unit",
    "tens",
    "hundreds",
    "thousands",
    "ten-thousands",
    "hundred-thousands",
    "millions",
    "ten-millions",
    "hundred-millions",
    "billions",
    "ten-billions",
    "hundred-billions"
  ];
  return labels[indexFromRight] || `10^${indexFromRight} place`;
}

function RowSelector({ template, cells, selectedSet, toggleCell }) {
  if (!cells.length) return null;
  const sample = cells[0];
  const row = getRowValue(template, sample);

  return (
    <div className="answer-group">
      <div className="answer-label">{rowTitle(sample)}</div>
      <div style={{ fontFamily: "Space Grotesk, monospace", marginBottom: 8 }}>{row}</div>
      <div className="answer-strip">
        {cells.map((cell) => {
          const key = cellKey(cell);
          return (
            <label key={key} className="soft-chip">
              <input
                type="checkbox"
                checked={selectedSet.has(key)}
                onChange={() => toggleCell(cell)}
              />
              <span>{placeValueLabel(cell.indexFromRight)}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function AuthorProblemForm({ onTemplateReady }) {
  const [prompt, setPrompt] = useState("Fill in the missing number:");
  const [operation, setOperation] = useState("*");
  const [operand1, setOperand1] = useState("60");
  const [operand2, setOperand2] = useState("72");
  const [selectedMissing, setSelectedMissing] = useState(new Set());

  const [generated, setGenerated] = useState(null);
  const [overrideResult, setOverrideResult] = useState("");
  const [overrideStepsText, setOverrideStepsText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const a = Number(operand1);
  const b = Number(operand2);
  const basicValid = Number.isInteger(a) && Number.isInteger(b) && a >= 0 && b >= 0;

  const availableCells = useMemo(() => {
    if (!generated?.template) return [];
    return getAllCells(generated.template);
  }, [generated]);

  const grouped = useMemo(() => {
    if (!generated?.template) return null;
    return groupByRow(availableCells);
  }, [generated, availableCells]);

  const selectedCells = useMemo(
    () => availableCells.filter((cell) => selectedMissing.has(cellKey(cell))),
    [availableCells, selectedMissing]
  );

  const studentPreviewTemplate = useMemo(() => {
    if (!generated?.template) return null;
    return maskTemplate(generated.template, selectedMissing);
  }, [generated, selectedMissing]);

  const clearGenerated = () => {
    setGenerated(null);
    setSelectedMissing(new Set());
    setOverrideResult("");
    setOverrideStepsText("");
  };

  const generate = async () => {
    setError("");
    clearGenerated();

    if (!prompt.trim()) return setError("Please write an instruction for the student.");
    if (!basicValid) return setError("Please enter valid non-negative integers.");
    if (operation === "/" && b === 0) return setError("Operand 2 cannot be 0 for division.");

    try {
      setLoading(true);
      const res = await previewTemplate({
        prompt,
        operation,
        operand1: a,
        operand2: b,
        missing: []
      });
      setGenerated(res);
      setOverrideResult(res.template.result);
      setOverrideStepsText((res.steps || []).join("\n"));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to generate preview");
    } finally {
      setLoading(false);
    }
  };

  const toggleCell = (cell) => {
    const key = cellKey(cell);
    setSelectedMissing((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const publish = async () => {
    setError("");

    if (!generated) return setError("Generate a template first.");
    if (selectedCells.length === 0) return setError("Select at least one missing cell.");

    const steps = overrideStepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setLoading(true);
      const res = await createTemplate({
        prompt,
        operation,
        operand1: a,
        operand2: b,
        missing: selectedCells,
        override: {
          result: String(overrideResult).trim(),
          steps
        }
      });
      onTemplateReady(res);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to publish problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <span className="soft-chip">Author Setup</span>
      <h3 style={{ margin: "10px 0 12px" }}>Create Column Operation Template</h3>

      <div className="form-grid">
        <label className="field">
          <span>Question / Instruction</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ minHeight: 60 }}
          />
        </label>

        <div
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))"
          }}
        >
          <label className="field">
            <span>Operation</span>
            <select
              value={operation}
              onChange={(e) => {
                setOperation(e.target.value);
                clearGenerated();
              }}
            >
              <option value="+">Addition (+)</option>
              <option value="-">Subtraction (-)</option>
              <option value="*">Multiplication (*)</option>
              <option value="/">Division (/)</option>
            </select>
          </label>

          <label className="field">
            <span>Operand 1</span>
            <input
              value={operand1}
              onChange={(e) => {
                setOperand1(e.target.value);
                clearGenerated();
              }}
            />
          </label>

          <label className="field">
            <span>Operand 2</span>
            <input
              value={operand2}
              onChange={(e) => {
                setOperand2(e.target.value);
                clearGenerated();
              }}
            />
          </label>
        </div>

        <div className="inline-actions">
          <button className="btn btn-secondary" onClick={generate} disabled={loading}>
            {loading ? "Generating..." : "Generate Format"}
          </button>
        </div>

        {error && <div className="status-bad">{error}</div>}

        {generated && grouped && (
          <>
            <div style={{ marginTop: 6, fontWeight: 700 }}>Select cells to hide for the student</div>

            <RowSelector
              template={generated.template}
              cells={grouped.top}
              selectedSet={selectedMissing}
              toggleCell={toggleCell}
            />
            <RowSelector
              template={generated.template}
              cells={grouped.bottom}
              selectedSet={selectedMissing}
              toggleCell={toggleCell}
            />
            {Object.keys(grouped.partials)
              .map(Number)
              .sort((aIdx, bIdx) => aIdx - bIdx)
              .map((index) => (
                <RowSelector
                  key={`partial-${index}`}
                  template={generated.template}
                  cells={grouped.partials[index]}
                  selectedSet={selectedMissing}
                  toggleCell={toggleCell}
                />
              ))}
            <RowSelector
              template={generated.template}
              cells={grouped.result}
              selectedSet={selectedMissing}
              toggleCell={toggleCell}
            />

            <div style={{ marginTop: 4, fontWeight: 700 }}>Student preview</div>
            {studentPreviewTemplate && <ColumnWorksheet template={studentPreviewTemplate} />}

            <label className="field">
              <span>Correct Answer (result)</span>
              <input value={overrideResult} onChange={(e) => setOverrideResult(e.target.value)} />
            </label>

            <label className="field">
              <span>Explanation steps (one line per step)</span>
              <textarea
                value={overrideStepsText}
                onChange={(e) => setOverrideStepsText(e.target.value)}
                style={{ minHeight: 120 }}
              />
            </label>

            <div className="inline-actions">
              <button className="btn btn-primary" onClick={publish} disabled={loading}>
                {loading ? "Publishing..." : "Publish Problem"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
