import React, { useState } from "react";
import { Lightbulb } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MATH_RECOGNITION_PROMPT } from "../prompts";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import DrawingCanvas from "./DrawingCanvas";
import LaTeXEditor from "./LaTeXEditor";

interface WriteTabProps {
  addOnUISdk?: AddOnSDKAPI;
}

const WriteTab: React.FC<WriteTabProps> = ({ addOnUISdk }) => {
  const [latexInput, setLatexInput] = useState("");
  const [error, setError] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [canvasImage, setCanvasImage] = useState<string | null>(null);

  const handleCanvasChange = (imageData: string | null) => {
    setCanvasImage(imageData);
  };

  const handleRecognize = async () => {
    if (!canvasImage) {
      setError("Please draw something on the canvas first");
      return;
    }

    setIsRecognizing(true);
    setError("");

    try {
      const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
      });

      const base64Data = canvasImage.split(",")[1];
      const mimeType = canvasImage.split(",")[0].split(":")[1].split(";")[0];

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
      setError(
        `Failed to recognize mathematical expression: ${err.message || err}`,
      );
    } finally {
      setIsRecognizing(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 10, fontSize: 15 }}>
        Handwrite any formula to recognize
      </div>

      <DrawingCanvas
        onCanvasChange={handleCanvasChange}
        width={280}
        height={140}
      />

      <button
        onClick={handleRecognize}
        disabled={isRecognizing || !canvasImage}
        style={{
          width: "100%",
          marginBottom: 10,
          padding: "6px 0",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: isRecognizing || !canvasImage ? "#fafafa" : "#fff",
          cursor: isRecognizing || !canvasImage ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontSize: 13,
          boxSizing: "border-box",
        }}
      >
        <Lightbulb size={16} />
        {isRecognizing ? "Analyzing drawing..." : "Recognize"}
      </button>

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

export default WriteTab;
