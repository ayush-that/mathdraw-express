import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import html2canvas from "html2canvas";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

interface LaTeXEditorProps {
  latexInput: string;
  setLatexInput: (value: string) => void;
  addOnUISdk?: AddOnSDKAPI;
  error?: string;
  setError?: (error: string) => void;
}

const LaTeXEditor: React.FC<LaTeXEditorProps> = ({
  latexInput,
  setLatexInput,
  addOnUISdk,
  error,
  setError,
}) => {
  const [previewHtml, setPreviewHtml] = useState("");
  const [isAddingToDesign, setIsAddingToDesign] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (latexInput.trim()) {
      try {
        const html = katex.renderToString(latexInput, {
          throwOnError: false,
          displayMode: true,
          output: "html",
        });

        setPreviewHtml(html);
        if (setError) setError("");
      } catch (err) {
        console.error(err);
      }
    } else {
      setPreviewHtml("");
      if (setError) setError("");
    }
  }, [latexInput, setError]);

  const addToDesign = async () => {
    if (!addOnUISdk || !previewHtml || !previewRef.current) return;

    setIsAddingToDesign(true);
    if (setError) setError("");

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 10,
        useCORS: true,
        allowTaint: false,
        width: previewRef.current.offsetWidth,
        height: previewRef.current.offsetHeight,
        scrollX: 0,
        scrollY: 0,
      });

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create PNG blob"));
            }
          },
          "image/png",
          1.0
        );
      });

      await addOnUISdk.app.document.addImage(pngBlob, {
        title: `LaTeX: ${latexInput.substring(0, 50)}${
          latexInput.length > 50 ? "..." : ""
        }`,
        author: "MathDraw Add-on",
      });
    } catch (err) {
      if (setError) setError(`${err}`);
    } finally {
      setIsAddingToDesign(false);
    }
  };

  return (
    <>
      {error && (
        <div
          style={{
            color: "#d32f2f",
            fontSize: 10,
            marginBottom: 8,
            padding: 4,
            background: "#ffebee",
            borderRadius: 4,
            border: "1px solid #ffcdd2",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ fontWeight: 600, marginBottom: 3, fontSize: 12 }}>
        LaTeX
      </div>
      <textarea
        value={latexInput}
        onChange={(e) => setLatexInput(e.target.value)}
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

      <div
        style={{
          fontWeight: 600,
          marginTop: 12,
          marginBottom: 3,
          fontSize: 12,
        }}
      >
        Preview
      </div>
      <div
        ref={previewRef}
        style={{
          width: "100%",
          minHeight: 60,
          maxHeight: 120,
          borderRadius: 4,
          padding: 8,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          overflow: "auto",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {previewHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: previewHtml }}
            style={{
              maxWidth: "100%",
              overflow: "hidden",
              textAlign: "center",
            }}
          />
        ) : (
          <div style={{ color: "#666", fontSize: 10, fontStyle: "italic" }}>
            Enter LaTeX to see preview
          </div>
        )}
      </div>

      <div
        style={{ fontSize: 10, color: "#666", marginTop: 4, marginBottom: 12 }}
      >
        Check the results closely to make sure they're accurate.
      </div>

      <button
        onClick={addToDesign}
        disabled={!previewHtml || isAddingToDesign || !addOnUISdk}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: previewHtml && !isAddingToDesign ? "#e6e6fa" : "#fafafa",
          color: previewHtml && !isAddingToDesign ? "#6b46c1" : "#999",
          fontWeight: 600,
          fontSize: 12,
          cursor: previewHtml && !isAddingToDesign ? "pointer" : "not-allowed",
          transition: "all 0.2s ease",
          boxSizing: "border-box",
        }}
      >
        {isAddingToDesign ? "Adding..." : "Add to design"}
      </button>
    </>
  );
};

export default LaTeXEditor;
