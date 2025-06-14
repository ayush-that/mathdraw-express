import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import html2canvas from "html2canvas";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

interface ImageTabProps {
  addOnUISdk?: AddOnSDKAPI;
}

const ImageTab: React.FC<ImageTabProps> = ({ addOnUISdk }) => {
  const [latexInput, setLatexInput] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [error, setError] = useState("");
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
        setError("");
      } catch (err) {
        console.error(err);
      }
    } else {
      setPreviewHtml("");
      setError("");
    }
  }, [latexInput]);

  const addToDesign = async () => {
    if (!addOnUISdk || !previewHtml || !previewRef.current) return;

    setIsAddingToDesign(true);
    setError("");

    try {
      console.log("Starting add to design process...");
      console.log("LaTeX Input:", latexInput);

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

      console.log(
        "Canvas created with dimensions:",
        canvas.width,
        "x",
        canvas.height
      );

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

      console.log("Created high-quality PNG Blob:", pngBlob);

      await addOnUISdk.app.document.addImage(pngBlob, {
        title: `LaTeX: ${latexInput.substring(0, 50)}${
          latexInput.length > 50 ? "..." : ""
        }`,
        author: "MathDraw Add-on",
      });

      console.log("Successfully added rendered LaTeX to design!");
    } catch (error) {
      console.error("Failed to add LaTeX to design:", error);
      setError(`Failed to add to design: ${error.message || error}`);
    } finally {
      setIsAddingToDesign(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 8, fontSize: 12 }}>
        Upload or select an image in your design to recognize
      </div>
      <div style={{ marginBottom: 6 }}>
        <button
          style={{
            padding: "6px 8px",
            borderRadius: 4,
            border: "1px solid #ccc",
            background: "#fafafa",
            cursor: "pointer",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            fontSize: 11,
            boxSizing: "border-box",
          }}
        >
          <span role="img" aria-label="upload">
            ☁️
          </span>
          Choose file
        </button>
      </div>
      <div style={{ fontSize: 10, color: "#666", marginBottom: 8 }}>
        Max file size: 1MB. Acceptable formats: jpeg, jpg, png. Don't use
        transparent backgrounds.
      </div>
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
        {error ? (
          <div style={{ color: "#d32f2f", fontSize: 10 }}>{error}</div>
        ) : previewHtml ? (
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
    </div>
  );
};

export default ImageTab;
