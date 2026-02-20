import { generateTests as generateTestsService } from '../services/geminiService.js';
import { validateSingleFunctionInput } from '../utils/validation.js';

/**
 * POST /api/generate-tests
 * Body: { code: string }
 * Returns: { success: true, testCode: string } | { success: false, error: string }
 */
export async function postGenerateTests(req, res) {
  const { code } = req.body ?? {};
  const validation = validateSingleFunctionInput(code);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const result = await generateTestsService(code, apiKey);
  const status = result.success ? 200 : 502;
  return res.status(status).json(result);
}
