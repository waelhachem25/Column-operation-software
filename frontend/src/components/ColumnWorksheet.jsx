import React from "react";

function opSymbol(op) {
  if (op === "*") return "×";
  if (op === "/") return "÷";
  return op || "";
}

function toChars(value) {
  return [...String(value ?? "")];
}

function paddedChars(value, width) {
  const chars = toChars(value);
  const pad = Math.max(0, width - chars.length);
  return [...Array(pad).fill(""), ...chars];
}

function Row({ sign = "", value = "", width, compact }) {
  return (
    <tr className={compact ? "cw-row cw-row-compact" : "cw-row"}>
      <td className="cw-sign">{sign}</td>
      {paddedChars(value, width).map((char, index) => (
        <td
          key={`${index}-${char || "empty"}`}
          className={`cw-cell ${char === "□" ? "cw-cell-missing" : ""}`}
        >
          {char}
        </td>
      ))}
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

export default function ColumnWorksheet({ template, compact = false }) {
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

  return (
    <div className={compact ? "cw-shell cw-shell-compact" : "cw-shell"}>
      <table className="cw-table" aria-label="Column worksheet">
        <tbody>
          <Row value={top} width={width} compact={compact} />
          <Row sign={opSymbol(template.operation)} value={bottom} width={width} compact={compact} />
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
              />
            );
          })}

          {partials.length > 0 && <Divider columns={width + 1} />}
          <Row value={result} width={width} compact={compact} />
        </tbody>
      </table>
    </div>
  );
}
