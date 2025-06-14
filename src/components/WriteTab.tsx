import React from "react";

const WriteTab: React.FC = () => {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 8, fontSize: 12 }}>
        Handwrite any formula to recognize
      </div>
      <div style={{ marginBottom: 6 }}>
        <div
          style={{
            width: "100%",
            height: 100,
            border: "1px solid #ccc",
            borderRadius: 4,
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontSize: 10,
            boxSizing: "border-box",
          }}
        >
          Drawing canvas area
        </div>
      </div>
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
        <span role="img" aria-label="recognize">
          💡
        </span>
        Recognize
      </button>
      <button
        style={{
          width: "100%",
          marginBottom: 8,
          padding: "4px 0",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: "#fafafa",
          cursor: "pointer",
          fontSize: 10,
          boxSizing: "border-box",
        }}
      >
        Clear canvas
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

export default WriteTab;
