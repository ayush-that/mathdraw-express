import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import html2canvas from "html2canvas";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import { Upload, Lightbulb, X } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MATH_RECOGNITION_PROMPT } from "../prompts";

interface ImageTabProps {
  addOnUISdk?: AddOnSDKAPI;
}

const ImageTab: React.FC<ImageTabProps> = ({ addOnUISdk }) => {
  const [latexInput, setLatexInput] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [error, setError] = useState("");
  const [isAddingToDesign, setIsAddingToDesign] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError("File size must be less than 1MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, JPG, and PNG files are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleRecognize = async () => {
    if (!uploadedImage) return;

    setIsRecognizing(true);
    setError("");

    try {
      const apiKey = process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error(
          "Gemini API key not found. Please check your environment variables."
        );
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        },
      });

      const base64Data = uploadedImage.split(",")[1];
      const mimeType = uploadedImage.split(",")[0].split(":")[1].split(";")[0];

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };

      const result = await model.generateContent([
        MATH_RECOGNITION_PROMPT,
        imagePart,
      ]);
      const response = await result.response;
      const text = response.text();

      console.log("Gemini API response:", text);

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from Gemini API");
      }

      const cleanLatex = text
        .replace(/```latex/g, "")
        .replace(/```/g, "")
        .replace(/^\$+|\$+$/g, "")
        .trim();

      if (!cleanLatex) {
        throw new Error("No valid LaTeX code extracted from the response");
      }

      setLatexInput(cleanLatex);
      console.log("Recognized LaTeX:", cleanLatex);
    } catch (err) {
      console.error("Recognition error:", err);
      setError(
        `Failed to recognize mathematical expression: ${err.message || err}`
      );
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setLatexInput("");
    setPreviewHtml("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      <div style={{ marginBottom: 6 }}>
        <button
          onClick={handleChooseFile}
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
          <Upload size={16} />
          Choose file
        </button>
      </div>

      {uploadedImage && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              width: "100%",
              minHeight: 120,
              maxHeight: 200,
              borderRadius: 4,
              border: "1px solid #ddd",
              background: "#f8f0ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            <img
              src={uploadedImage}
              alt="Uploaded mathematical expression"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={handleRecognize}
              disabled={isRecognizing}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 4,
                border: "1px solid #ccc",
                background: isRecognizing ? "#fafafa" : "#fff",
                cursor: isRecognizing ? "not-allowed" : "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Lightbulb size={16} />
              {isRecognizing ? "Analyzing image..." : "Recognize"}
            </button>
          </div>

          <button
            onClick={handleClearImage}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: "#fafafa",
              cursor: "pointer",
              fontSize: 11,
              color: "#666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <X size={14} />
            Clear image
          </button>
        </div>
      )}

      <div style={{ fontSize: 10, color: "#666", marginBottom: 8 }}>
        Max file size: 1MB. Acceptable formats: jpeg, jpg, png. Don't use
        transparent backgrounds.
      </div>

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
    </div>
  );
};

export default ImageTab;
