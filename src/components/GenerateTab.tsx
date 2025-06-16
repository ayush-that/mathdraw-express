import React, { useState } from "react";
import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MATH_GENERATION_PROMPT } from "../prompts";
import LaTeXEditor from "./LaTeXEditor";
import "@spectrum-web-components/textfield/sp-textfield.js";
import "@spectrum-web-components/button/sp-button.js";

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
        Formula Idea
      </div>

      <sp-textfield
        multiline
        grows
        value={prompt}
        placeholder="e.g. Integral of sin(x)"
        style={{
          width: "100%",
          marginBottom: 8,
        }}
        onInput={(e: any) => setPrompt(e.target.value)}
      />

      <sp-button
        onClick={handleTryExample}
        style={{ width: "100%", marginBottom: 8 }}
      >
        Try an example
      </sp-button>

      {isGenerating || !prompt.trim() ? (
        <sp-button
          variant="primary"
          disabled
          style={{ width: "100%", marginBottom: 14 }}
        >
          {isGenerating ? "Generating LaTeX..." : "Generate LaTeX"}
        </sp-button>
      ) : (
        <sp-button
          variant="primary"
          onClick={handleGenerate}
          style={{ width: "100%", marginBottom: 14 }}
        >
          Generate LaTeX
        </sp-button>
      )}

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
