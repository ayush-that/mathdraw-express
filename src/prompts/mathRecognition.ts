export const MATH_RECOGNITION_PROMPT = `Analyze this image containing a handwritten mathematical expression or equation. 

Your task is to:
1. Identify all mathematical expressions, equations, or formulas in the image
2. Convert them to proper LaTeX code
3. Return ONLY the LaTeX code without any explanation, markdown formatting, or additional text

Important guidelines:
- Use proper LaTeX syntax (e.g., \\frac{}{}, \\sqrt{}, x^{}, x_{}, \\left(, \\right))
- For fractions, use \\frac{numerator}{denominator}
- For square roots, use \\sqrt{expression}
- For superscripts, use x^{power}
- For subscripts, use x_{index}
- For parentheses around complex expressions, use \\left( and \\right)
- For simple arithmetic like "2+2", just return "2+2"
- For equations like "x=5", just return "x=5"
- If there are multiple expressions, separate them with newlines

IMPORTANT: Return ONLY the LaTeX code, no explanations, no "The LaTeX code is:", no markdown blocks, just the raw LaTeX.

Examples:
- If you see "2+2" written, return: 2+2
- If you see "x²+1" written, return: x^2+1
- If you see a fraction, return: \\frac{a}{b}

Return only the clean LaTeX code.`;
