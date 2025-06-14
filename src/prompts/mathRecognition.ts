export const MATH_RECOGNITION_PROMPT = `Analyze this image containing a mathematical expression or equation. 

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
- If there are multiple expressions, separate them with newlines

Return only the clean LaTeX code.`;
