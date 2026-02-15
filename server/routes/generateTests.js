import { generateTests as generateTestsService } from '../services/geminiService.js';

/**
 * POST /api/generate-tests
 * Body: { code: string }
 * Returns: { success: true, testCode: string } | { success: false, error: string }
 */
export async function postGenerateTests(req, res) {
  const { code } = req.body ?? {};
  const apiKey = process.env.GEMINI_API_KEY;
  const result = await generateTestsService(code, apiKey);
  res.json(result);
}
