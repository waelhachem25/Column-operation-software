import React from "react";

function opSymbol(op) {
  if (op === "*") return "×";
  if (op === "/") return "÷";
  return op || "";
}

function toChars(value) {
  return [...String(value ?? "")];
}

function paddedCells(value, width) {
  const chars = toChars(value);
  const pad = Math.max(0, width - chars.length);
  return [
    ...Array(pad)
      .fill(null)
      .map(() => ({ char: "", indexFromRight: null })),
    ...chars.map((char, index) => ({ char, indexFromRight: chars.length - 1 - index }))
  ];
}

function cellKey(cell) {
  if (cell.row === "partial") {
    return `${cell.row}:${cell.partialIndex}:${cell.indexFromRight}`;
  }
  return `${cell.row}::${cell.indexFromRight}`;
}

function rowLabel(row, partialIndex) {
  if (row === "top") return "Top row";
  if (row === "bottom") return "Bottom row";
  if (row === "result") return "Result row";
  return `Partial row ${partialIndex + 1}`;
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

function Row({
  sign = "",
  value = "",
  width,
  compact,
  rowMeta,
  editableKeys,
  inputs,
  onInputChange
}) {
  return (
    <tr className={compact ? "cw-row cw-row-compact" : "cw-row"}>
      <td className="cw-sign">{sign}</td>
      {paddedCells(value, width).map((cell, index) => {
        const char = cell.char;
        const editableCell =
          cell.indexFromRight == null
            ? null
            : {
                row: rowMeta.row,
                indexFromRight: cell.indexFromRight,
                ...(rowMeta.row === "partial" ? { partialIndex: rowMeta.partialIndex } : {})
              };
        const key = editableCell ? cellKey(editableCell) : null;
        const isEditable = !!(key && editableKeys?.has(key) && onInputChange);
        const classes = [
          "cw-cell",
          char === "□" || isEditable ? "cw-cell-missing" : "",
          isEditable ? "cw-cell-editable" : ""
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <td key={index} className={classes}>
            {isEditable ? (
              <input
                className="cw-inline-input"
                value={inputs?.[key] ?? ""}
                onChange={(e) => onInputChange(editableCell, e.target.value)}
                inputMode="decimal"
                maxLength={1}
                aria-label={`${rowLabel(editableCell.row, editableCell.partialIndex)} ${placeValueLabel(
                  editableCell.indexFromRight
                )}`}
              />
            ) : (
              char
            )}
          </td>
        );
      })}
    </tr>
  );
}

function Divider({ columns }) {
  return (
    <tr className="cw-divider-row">
      <td className="cw-divider" colSpan={columns} />
    </tr>
  );
}

export default function ColumnWorksheet({
  template,
  compact = false,
  editableCells = [],
  cellInputs = {},
  onCellInputChange
}) {
  if (!template) return null;

  const top = template.top ?? "";
  const bottom = template.bottom ?? "";
  const partials = template.partials ?? [];
  const result = template.result ?? "";

  const width = Math.max(
    1,
    toChars(top).length,
    toChars(bottom).length,
    toChars(result).length,
    ...partials.map((p) => toChars(p).length)
  );
  const editableKeys =
    typeof onCellInputChange === "function"
      ? new Set((editableCells || []).map((cell) => cellKey(cell)))
      : null;

  return (
    <div className={compact ? "cw-shell cw-shell-compact" : "cw-shell"}>
      <table className="cw-table" aria-label="Column worksheet">
        <tbody>
          <Row
            value={top}
            width={width}
            compact={compact}
            rowMeta={{ row: "top" }}
            editableKeys={editableKeys}
            inputs={cellInputs}
            onInputChange={onCellInputChange}
          />
          <Row
            sign={opSymbol(template.operation)}
            value={bottom}
            width={width}
            compact={compact}
            rowMeta={{ row: "bottom" }}
            editableKeys={editableKeys}
            inputs={cellInputs}
            onInputChange={onCellInputChange}
          />
          <Divider columns={width + 1} />

          {partials.map((partial, index) => {
            const sign = partials.length > 1 && index === partials.length - 1 ? "+" : "";
            return (
              <Row
                key={`partial-${index}`}
                sign={sign}
                value={partial}
                width={width}
                compact={compact}
                rowMeta={{ row: "partial", partialIndex: index }}
                editableKeys={editableKeys}
                inputs={cellInputs}
                onInputChange={onCellInputChange}
              />
            );
          })}

          {partials.length > 0 && <Divider columns={width + 1} />}
          <Row
            value={result}
            width={width}
            compact={compact}
            rowMeta={{ row: "result" }}
            editableKeys={editableKeys}
            inputs={cellInputs}
            onInputChange={onCellInputChange}
          />
        </tbody>
      </table>
    </div>
  );
}
