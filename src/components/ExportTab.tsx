import React from "react";

const ExportTab: React.FC = () => {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 8, fontSize: 12 }}>
        Draw any formula on your design and export it to recognize
      </div>
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
        Export design
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

export default ExportTab;
