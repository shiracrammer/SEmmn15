import { GoogleGenerativeAI } from '@google/generative-ai';

const instructions = `You are a test-generation expert. Generate a complete Vitest test suite for the following JavaScript/TypeScript function.

Requirements:
- Use Vitest (describe, it, expect).
- Include standard (happy-path) test cases.
- Include edge cases (empty input, boundaries, null/undefined where applicable).
- Apply partition testing (equivalence classes) where relevant.
- Use mock objects (vi.fn(), vi.mock(), or similar) where dependencies need to be mocked.
- Include exception testing: use expect().rejects.toThrow() or expect(() => fn()).toThrow() (or equivalent) for functions that throw or return rejected promises.
- Use clear test names and arrange-act-assert structure.
- Output ONLY the test code: no markdown fences, no explanation. The response must be valid Vitest code that can be pasted into a .test.js or .test.ts file.`;

function buildPrompt(userCode) {
  return `${instructions}

Function to test:

\`\`\`javascript
${userCode}
\`\`\`

Generate the Vitest test suite now. Output only the test code, no markdown.`;
}

/**
 * Strips markdown code fences from model output so the frontend receives plain code.
 */
function stripMarkdownFences(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/^```(?:javascript|js|typescript|ts)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();
}

/**
 * Calls the Gemini API to generate a Vitest test suite for the given code.
 * @param {string} userCode - The JavaScript/TypeScript function code
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<{ success: true, testCode: string } | { success: false, error: string }>}
 */
export async function generateTests(userCode, apiKey) {
  if (!apiKey) {
    return { success: false, error: 'Server configuration error: Gemini API key is missing.' };
  }
  if (!userCode || typeof userCode !== 'string') {
    return { success: false, error: 'Invalid input: code is required.' };
  }
  const trimmed = userCode.trim();
  if (!trimmed) {
    return { success: false, error: 'Invalid input: code cannot be empty.' };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelId = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const model = genAI.getGenerativeModel({ model: modelId });
    const prompt = buildPrompt(trimmed);
    const result = await model.generateContent(prompt);
    const response = result.response;
    if (!response || !response.text) {
      return { success: false, error: 'No response received from the model.' };
    }
    const rawText = response.text();
    const testCode = stripMarkdownFences(rawText);
    return { success: true, testCode };
  } catch (err) {
    const message = err.message || String(err);
    if (message.includes('API_KEY') || message.includes('401') || message.includes('403')) {
      return { success: false, error: 'Invalid or missing API key. Check server configuration.' };
    }
    if (message.includes('quota') || message.includes('429')) {
      return { success: false, error: 'Rate limit exceeded. Please try again later.' };
    }
    return { success: false, error: `Test generation failed: ${message}` };
  }
}
