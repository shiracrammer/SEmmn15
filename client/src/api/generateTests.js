const API_BASE = '';

/**
 * Sends the user's code to the backend and returns the generated test suite or an error.
 * @param {string} code - JavaScript/TypeScript function code
 * @returns {Promise<{ success: true, testCode: string } | { success: false, error: string }>}
 */
export async function generateTests(code) {
  const res = await fetch(`${API_BASE}/api/generate-tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, error: data.error || 'Request failed.' };
  }
  return data;
}
