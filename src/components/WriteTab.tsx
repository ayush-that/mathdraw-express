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

      console.log("📷 Processing canvas image...");
      const base64Data = canvasImage.split(",")[1];
      const mimeType = canvasImage.split(",")[0].split(":")[1].split(";")[0];

      console.log(
        "📊 Image data - MIME type:",
        mimeType,
        "Base64 length:",
        base64Data.length
      );

      // Create a temporary image element to verify the canvas data
      const tempImg = new Image();
      tempImg.onload = () => {
        console.log("✅ Canvas image is valid:", {
          width: tempImg.width,
          height: tempImg.height,
          src: canvasImage.substring(0, 50) + "...",
        });
      };
      tempImg.onerror = () => {
        console.log("❌ Canvas image is invalid or corrupted");
      };
      tempImg.src = canvasImage;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };

      console.log("📤 Sending request to Gemini...");
      console.log("🔍 Request payload:", {
        prompt: MATH_RECOGNITION_PROMPT.substring(0, 100) + "...",
        imageSize: base64Data.length,
        mimeType: mimeType,
      });

      const result = await model.generateContent([
        MATH_RECOGNITION_PROMPT,
        imagePart,
      ]);

      console.log("📦 Raw result object:", result);

      // Check if there are any safety or other issues
      if (result.response.promptFeedback) {
        console.log("⚠️ Prompt feedback:", result.response.promptFeedback);
      }

      const response = await result.response;
      console.log("📦 Response object:", response);

      // Check for safety ratings or blocks
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];
        console.log("🔍 Candidate details:", {
          finishReason: candidate.finishReason,
          safetyRatings: candidate.safetyRatings,
          content: candidate.content,
        });
      }

      const text = response.text();
      console.log("📥 Gemini API response:", text);
      console.log("📝 Raw response length:", text.length);
      console.log("📝 Response type:", typeof text);

      if (!text || text.trim().length === 0) {
        console.log("❌ Empty response details:", {
          text: text,
          textLength: text?.length,
          trimmedLength: text?.trim()?.length,
          responseObject: response,
        });
        throw new Error("Empty response from Gemini API");
      }

      // Simple LaTeX cleaning (matching ImageTab logic)
      const cleanLatex = text
        .replace(/```latex/g, "")
        .replace(/```/g, "")
        .replace(/^\$+|\$+$/g, "")
        .trim();

      console.log("✨ Cleaned LaTeX:", cleanLatex);
      console.log("📏 Cleaned LaTeX length:", cleanLatex.length);

      if (!cleanLatex) {
        console.log(
          "❌ No content after cleaning. Original response was:",
          text
        );
        throw new Error("Invalid LaTeX code");
      }

      console.log("🔄 Setting LaTeX input to:", cleanLatex);
      setLatexInput(cleanLatex);
      console.log("✅ Recognition completed successfully");

      // Verify the state was updated
      setTimeout(() => {
        console.log("🔍 Current latexInput state:", latexInput);
      }, 100);
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
        height={140}
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
