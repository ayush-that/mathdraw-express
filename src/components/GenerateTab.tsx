import React from "react";

const GenerateTab: React.FC = () => {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 8, fontSize: 12 }}>
        Enter a mathematical concept, formula name, or description.
      </div>
      <div style={{ fontWeight: 600, marginBottom: 3, fontSize: 12 }}>
        Formula idea
      </div>
      <input
        style={{
          width: "100%",
          padding: 4,
          borderRadius: 4,
          border: "1px solid #ccc",
          marginBottom: 6,
          boxSizing: "border-box",
          fontSize: 10,
        }}
        placeholder="e.g. Quadratic formula"
      />
      <button
        style={{
          width: "100%",
          marginBottom: 6,
          padding: "4px 0",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: "#fafafa",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontSize: 10,
          boxSizing: "border-box",
        }}
      >
        + Try an example
      </button>
      <button
        style={{
          width: "100%",
          marginBottom: 8,
          padding: "6px 0",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: "#fafafa",
          cursor: "pointer",
          fontSize: 11,
          boxSizing: "border-box",
        }}
      >
        Generate LaTeX
      </button>
      <div style={{ fontWeight: 600, marginBottom: 3, fontSize: 12 }}>
        LaTeX
      </div>
      <textarea
        style={{
          width: "100%",
          minHeight: 35,
          borderRadius: 4,
          border: "1px solid #ccc",
          padding: 4,
          resize: "vertical",
          fontFamily: "monospace",
          fontSize: 10,
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};

export default GenerateTab;
