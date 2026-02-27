import React from "react";

export default function ResultDisplay({ result }) {
  if (!result) return null;

  // API-level error (e.g., invalid operation, division by zero, operand1 < operand2)
  if (result.success === false) {
    return (
      <div style={styles.card}>
        <div style={{ ...styles.badge, ...styles.badgeError }}>Error</div>
        <div style={{ marginTop: 10, color: "#b00020" }}>
          {result.message}
        </div>
      </div>
    );
  }

  // Correct
  if (result.isCorrect) {
    return (
      <div style={styles.card}>
        <div style={{ ...styles.badge, ...styles.badgeSuccess }}>✅ Correct</div>
        <div style={{ marginTop: 10, color: "#1b5e20" }}>
          Well done.
        </div>
      </div>
    );
  }

  // Wrong
  return (
    <div style={styles.card}>
      <div style={{ ...styles.badge, ...styles.badgeFail }}>❌ False</div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 700 }}>Correct Answer:</div>
        <div style={{ fontSize: 18 }}>{result.correctAnswer}</div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Explanation Steps:</div>

        <ol style={styles.steps}>
          {result.steps?.map((s, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const styles = {
  card: {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff"
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 14
  },
  badgeSuccess: {
    background: "#e8f5e9",
    color: "#1b5e20"
  },
  badgeFail: {
    background: "#ffebee",
    color: "#b71c1c"
  },
  badgeError: {
    background: "#fff3e0",
    color: "#e65100"
  },
  steps: {
    margin: 0,
    paddingLeft: 18
  }
};