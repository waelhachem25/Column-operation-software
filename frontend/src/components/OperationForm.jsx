import React, { useState } from "react";

export default function OperationForm({ onSubmit, loading }) {
  const [operand1, setOperand1] = useState("");
  const [operand2, setOperand2] = useState("");
  const [operation, setOperation] = useState("+");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const a = Number(operand1);
    const b = Number(operand2);
    const ans = Number(studentAnswer);

    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(ans)) {
      setError("Please enter valid numbers.");
      return;
    }

    if (!Number.isInteger(a) || !Number.isInteger(b) || !Number.isInteger(ans)) {
      setError("Only integers are supported.");
      return;
    }

    if (a < 0 || b < 0) {
      setError("Only non-negative integers are allowed.");
      return;
    }

    if (operation === "/" && b === 0) {
      setError("Division by zero is not allowed.");
      return;
    }

    onSubmit({
      operand1: a,
      operand2: b,
      operation,
      studentAnswer: ans
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <label>Operand 1</label>
        <input
          value={operand1}
          onChange={(e) => setOperand1(e.target.value)}
          placeholder="e.g. 123"
          required
        />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label>Operation</label>
        <select value={operation} onChange={(e) => setOperation(e.target.value)}>
          <option value="+">+</option>
          <option value="-">-</option>
          <option value="*">*</option>
          <option value="/">/</option>
        </select>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label>Operand 2</label>
        <input
          value={operand2}
          onChange={(e) => setOperand2(e.target.value)}
          placeholder="e.g. 45"
          required
        />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label>Student Answer</label>
        <input
          value={studentAnswer}
          onChange={(e) => setStudentAnswer(e.target.value)}
          placeholder="e.g. 168"
          required
        />
      </div>

      {error && (
        <div style={{ color: "crimson", fontSize: 14 }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Checking..." : "Submit"}
      </button>
    </form>
  );
}