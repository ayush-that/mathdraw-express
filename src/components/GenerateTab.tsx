import React, { useState } from "react";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import { Sparkles, Lightbulb } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MATH_GENERATION_PROMPT } from "../prompts";
import LaTeXEditor from "./LaTeXEditor";

interface GenerateTabProps {
  addOnUISdk?: AddOnSDKAPI;
}

const GenerateTab: React.FC<GenerateTabProps> = ({ addOnUISdk }) => {
  const [prompt, setPrompt] = useState("");
  const [latexOutput, setLatexOutput] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const examplePrompts = [
    "Quadratic formula",
    "Pythagorean theorem",
    "Area of a circle",
    "Derivative of sine function",
    "Integral of x squared",
    "Euler's identity",
    "Chain rule",
    "Law of cosines",
    "Gaussian distribution",
    "Binomial theorem",
  ];

  const handleTryExample = () => {
    const randomExample =
      examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    setPrompt(randomExample);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a mathematical concept or description");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
      });

      const fullPrompt = `${MATH_GENERATION_PROMPT}
      User request: "${prompt}"
      Generate the LaTeX:`;

      const result = await model.generateContent(fullPrompt);
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
        throw new Error("Invalid LaTeX code generated");
      }

      setLatexOutput(cleanLatex);
    } catch (err) {
      setError(`Failed to generate LaTeX: ${err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 10, fontSize: 15 }}>
        Enter a mathematical concept, formula name, or description of what you
        want to generate.
      </div>

      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>
        Formula idea
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. Quadratic formula, Pythagorean theorem, or Integral of sin(x)"
        style={{
          width: "100%",
          minHeight: 60,
          padding: 8,
          borderRadius: 4,
          border: "1px solid #ccc",
          marginBottom: 8,
          boxSizing: "border-box",
          fontSize: 14,
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />

      <button
        onClick={handleTryExample}
        style={{
          width: "100%",
          marginBottom: 8,
          padding: "6px 0",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: "#fafafa",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontSize: 13,
          boxSizing: "border-box",
        }}
      >
        <Lightbulb size={14} />
        Try an example
      </button>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        style={{
          width: "100%",
          marginBottom: 14,
          padding: "8px 0",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: isGenerating || !prompt.trim() ? "#fafafa" : "#fff",
          cursor: isGenerating || !prompt.trim() ? "not-allowed" : "pointer",
          fontSize: 14,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontWeight: 500,
        }}
      >
        <Sparkles size={16} />
        {isGenerating ? "Generating LaTeX..." : "Generate LaTeX"}
      </button>

      <LaTeXEditor
        latexInput={latexOutput}
        setLatexInput={setLatexOutput}
        addOnUISdk={addOnUISdk}
        error={error}
        setError={setError}
      />
    </div>
  );
};

export default GenerateTab;
