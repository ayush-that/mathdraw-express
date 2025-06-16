import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import html2canvas from "html2canvas";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import "@spectrum-web-components/textfield/sp-textfield.js";
import "@spectrum-web-components/button/sp-button.js";
import { Textfield } from "@spectrum-web-components/textfield";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "sp-textfield": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        multiline?: boolean;
        grows?: boolean;
        value?: string;
        placeholder?: string;
        onInput?: (event: any) => void;
      };
      "sp-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        variant?: string;
        size?: string;
        disabled?: boolean;
        onClick?: (event: any) => void;
      };
    }
  }
}

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
  const [previewScale, setPreviewScale] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (latexInput.trim()) {
      try {
        const hasLatexCommands = /\\[a-zA-Z]+|[\{\}\[\]_^]/.test(latexInput);

        let processedInput = latexInput;

        if (!hasLatexCommands) {
          processedInput = `\\text{${latexInput}}`;
        }

        const html = katex.renderToString(processedInput, {
          throwOnError: false,
          displayMode: true,
          output: "html",
        });

        setPreviewHtml(html);
        if (setError) setError("");
      } catch (err) {
        if (setError) setError(`LaTeX rendering error: ${err}`);
      }
    } else {
      setPreviewHtml("");
      if (setError) setError("");
    }
  }, [latexInput, setError]);

  useEffect(() => {
    if (previewHtml && previewRef.current && contentRef.current) {
      const calculateScale = () => {
        const container = previewRef.current;
        const content = contentRef.current;

        if (!container || !content) return;

        content.style.transform = "scale(1)";

        const containerWidth = container.clientWidth - 16;
        const containerHeight = container.clientHeight - 16;
        const contentWidth = content.scrollWidth;
        const contentHeight = content.scrollHeight;

        const scaleX = containerWidth / contentWidth;
        const scaleY = containerHeight / contentHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        setPreviewScale(scale);
      };

      const timer = setTimeout(calculateScale, 50);
      return () => clearTimeout(timer);
    }
  }, [previewHtml]);

  const addToDesign = async () => {
    if (!addOnUISdk || !previewHtml) return;

    setIsAddingToDesign(true);
    if (setError) setError("");

    try {
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      tempContainer.style.padding = "8px";
      tempContainer.style.display = "inline-block";
      tempContainer.style.fontSize = "14px";

      const contentDiv = document.createElement("div");
      contentDiv.innerHTML = previewHtml;
      contentDiv.style.textAlign = "center";
      contentDiv.style.lineHeight = "1.4";
      contentDiv.style.display = "block";

      tempContainer.appendChild(contentDiv);
      document.body.appendChild(tempContainer);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(tempContainer, {
        backgroundColor: null,
        scale: 8,
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        logging: false,
      });

      document.body.removeChild(tempContainer);

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
          1.0,
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
            fontSize: 13,
            marginBottom: 10,
            padding: 4,
            background: "#ffebee",
            borderRadius: 4,
            border: "1px solid #ffcdd2",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>
        LaTeX
      </div>
      <sp-textfield
        multiline
        grows
        value={latexInput}
        placeholder="Enter LaTeX code here..."
        style={
          {
            width: "100%",
            fontFamily: "monospace",
            "--spectrum-textfield-placeholder-color": "#999",
            "--spectrum-textfield-placeholder-color-hover": "#999",
            "--spectrum-textfield-placeholder-color-focus": "#999",
          } as React.CSSProperties
        }
        onInput={(e: any) => setLatexInput(e.target.value)}
      />

      <div
        style={{
          fontWeight: 600,
          marginTop: 14,
          marginBottom: 4,
          fontSize: 15,
        }}
      >
        Preview
      </div>
      <div
        ref={previewRef}
        style={{
          width: "100%",
          minHeight: 60,
          maxHeight: 200,
          borderRadius: 4,
          border: "1px solid #e0e0e0",
          padding: 8,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          overflow: "hidden",
          backgroundColor: "#fafafa",
        }}
      >
        {previewHtml ? (
          <div
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
            style={{
              textAlign: "center",
              lineHeight: "1.4",
              transform: `scale(${previewScale})`,
              transformOrigin: "center",
              transition: "transform 0.2s ease",
            }}
          />
        ) : (
          <div style={{ color: "#666", fontSize: 13, fontStyle: "italic" }}>
            Enter LaTeX to see preview
          </div>
        )}
      </div>

      <div
        style={{ fontSize: 13, color: "#666", marginTop: 6, marginBottom: 14 }}
      >
        Check the results closely to make sure they're accurate.
      </div>

      {!previewHtml || isAddingToDesign || !addOnUISdk ? (
        <sp-button variant="primary" disabled style={{ width: "100%" }}>
          {isAddingToDesign ? "Adding..." : "Add to design"}
        </sp-button>
      ) : (
        <sp-button
          variant="primary"
          onClick={addToDesign}
          style={{ width: "100%" }}
        >
          Add to design
        </sp-button>
      )}
    </>
  );
};

export default LaTeXEditor;
