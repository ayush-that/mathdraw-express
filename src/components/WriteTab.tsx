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
    console.log(
      "🎨 Canvas changed, imageData:",
      imageData ? `${imageData.length} characters` : "null"
    );
    setCanvasImage(imageData);
  };

  const handleRecognize = async () => {
    console.log("🔍 Recognize button clicked");
    console.log("🖼️ Canvas image available:", !!canvasImage);

    if (!canvasImage) {
      console.log("❌ No canvas image available");
      setError("Please draw something on the canvas first");
      return;
    }

    console.log("🚀 Starting Gemini recognition...");
    setIsRecognizing(true);
    setError("");

    try {
      const apiKey = process.env.VITE_GEMINI_API_KEY;
      console.log("🔑 API key available:", !!apiKey);

      if (!apiKey) {
        throw new Error(
          "Gemini API key not found. Please check your environment variables."
        );
      }

      console.log("🤖 Creating Gemini AI instance...");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        },
      });

      console.log("📷 Processing canvas image...");
      const base64Data = canvasImage.split(",")[1];
      const mimeType = canvasImage.split(",")[0].split(":")[1].split(";")[0];

      console.log(
        "📊 Image data - MIME type:",
        mimeType,
        "Base64 length:",
        base64Data.length
      );

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };

      console.log("📤 Sending request to Gemini...");
      const result = await model.generateContent([
        MATH_RECOGNITION_PROMPT,
        imagePart,
      ]);
      const response = await result.response;
      const text = response.text();

      console.log("📥 Gemini API response:", text);
      console.log("📝 Raw response length:", text.length);

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from Gemini API");
      }

      // More flexible LaTeX cleaning
      let cleanLatex = text.trim();

      // Remove markdown code blocks
      cleanLatex = cleanLatex.replace(/```latex\s*/gi, "");
      cleanLatex = cleanLatex.replace(/```\s*/g, "");

      // Remove dollar signs from start and end
      cleanLatex = cleanLatex.replace(/^\$+/, "").replace(/\$+$/, "");

      // Remove common prefixes that Gemini might add
      cleanLatex = cleanLatex.replace(
        /^(the\s+)?(latex\s+)?(code\s+)?(is\s*:?\s*)/gi,
        ""
      );
      cleanLatex = cleanLatex.replace(
        /^(here\s+is\s+the\s+latex\s*:?\s*)/gi,
        ""
      );

      // Clean up whitespace
      cleanLatex = cleanLatex.trim();

      console.log("✨ Cleaned LaTeX:", cleanLatex);
      console.log("📏 Cleaned LaTeX length:", cleanLatex.length);

      if (!cleanLatex || cleanLatex.length === 0) {
        console.log(
          "❌ No content after cleaning. Original response was:",
          text
        );
        throw new Error(
          `No valid LaTeX code extracted from the response. Original response: "${text}"`
        );
      }

      setLatexInput(cleanLatex);
      console.log("✅ Recognition completed successfully");
    } catch (err) {
      console.error("❌ Recognition error:", err);
      setError(
        `Failed to recognize mathematical expression: ${err.message || err}`
      );
    } finally {
      setIsRecognizing(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 8, fontSize: 12 }}>
        Handwrite any formula to recognize
      </div>

      <DrawingCanvas
        onCanvasChange={handleCanvasChange}
        width={280}
        height={120}
      />

      <button
        onClick={handleRecognize}
        disabled={isRecognizing || !canvasImage}
        style={{
          width: "100%",
          marginBottom: 8,
          padding: "6px 0",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: isRecognizing || !canvasImage ? "#fafafa" : "#fff",
          cursor: isRecognizing || !canvasImage ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontSize: 10,
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
