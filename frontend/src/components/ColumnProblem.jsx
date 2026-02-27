import React from "react";

function padLeft(str, len) {
  return str.padStart(len, " ");
}

export default function ColumnProblem({ operand1, operand2, operation }) {
  const a = String(operand1 ?? "");
  const b = String(operand2 ?? "");
  const width = Math.max(a.length, b.length) + 2;

  const line1 = padLeft(a, width);
  const line2 = operation + padLeft(b, width - 1);
  const sep = "-".repeat(width);

  return (
    <pre
      style={{
        background: "#111",
        color: "#fff",
        padding: 16,
        borderRadius: 10,
        fontSize: 18,
        width: "fit-content",
        minWidth: 200
      }}
    >
{`${line1}\n${line2}\n${sep}`}
    </pre>
  );
}