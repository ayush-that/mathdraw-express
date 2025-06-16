import React, { useState, useRef } from "react";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import { Upload, Lightbulb, X } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MATH_RECOGNITION_PROMPT } from "../prompts";
import LaTeXEditor from "./LaTeXEditor";
import "@spectrum-web-components/dropzone/sp-dropzone.js";
import "@spectrum-web-components/button/sp-button.js";

// Declare the custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "sp-dropzone": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        accept?: string;
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

interface ImageTabProps {
  addOnUISdk?: AddOnSDKAPI;
}

const ImageTab: React.FC<ImageTabProps> = ({ addOnUISdk }) => {
  const [latexInput, setLatexInput] = useState("");
  const [error, setError] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRecognize = async () => {
    if (!uploadedImage) return;

    setIsRecognizing(true);
    setError("");

    try {
      const apiKey = process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error(
          "Gemini API key not found. Please check your environment variables.",
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

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from Gemini API");
      }

      const cleanLatex = text
        .replace(/```latex/g, "")
        .replace(/```/g, "")
        .replace(/^\$+|\$+$/g, "")
        .trim();

      if (!cleanLatex) {
        throw new Error("Invalid LaTeX code");
      }

      setLatexInput(cleanLatex);
    } catch (err) {
      setError(`${err}`);
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setLatexInput("");
    setError("");
  };

  const handleFileSelect = (file: File) => {
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

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 10, fontSize: 15 }}>
        Upload or select an image in your design to recognize
      </div>

      <div style={{ marginBottom: 8 }}>
        <sp-dropzone
          style={{
            width: "100%",
            minHeight: "60px",
            borderRadius: "4px",
            border: "2px dashed #ccc",
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "14px",
            boxSizing: "border-box",
            padding: "12px",
          }}
          onClick={handleDropzoneClick}
          onDragOver={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
              handleFileSelect(files[0]);
            }
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexDirection: "column",
            }}
          >
            <Upload size={20} />
            <span>Drop image here or click to browse</span>
            <span style={{ fontSize: "12px", color: "#666" }}>
              JPEG, JPG, PNG (max 1MB)
            </span>
          </div>
        </sp-dropzone>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(file);
            }
          }}
        />
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
            {isRecognizing ? (
              <sp-button variant="primary" disabled style={{ flex: 1 }}>
                Analyzing image...
              </sp-button>
            ) : (
              <sp-button
                variant="primary"
                onClick={handleRecognize}
                style={{ flex: 1 }}
              >
                Recognize
              </sp-button>
            )}
          </div>

          <sp-button onClick={handleClearImage} style={{ width: "100%" }}>
            Clear image
          </sp-button>
        </div>
      )}

      <div style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>
        Max file size: 1MB. Acceptable formats: jpeg, jpg, png. Don't use
        transparent backgrounds.
      </div>

      <LaTeXEditor
        latexInput={latexInput}
        setLatexInput={setLatexInput}
        addOnUISdk={addOnUISdk}
        error={error}
        setError={setError}
      />
    </div>
  );
};

export default ImageTab;
