import { useState, useCallback } from 'react';
import { generateTests } from './api/generateTests.js';
import { CodeInput } from './components/CodeInput.jsx';
import { GenerateButton } from './components/GenerateButton.jsx';
import { TestOutput } from './components/TestOutput.jsx';
import { CopyButton } from './components/CopyButton.jsx';

export default function App() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [isError, setIsError] = useState(false);

  const handleGenerate = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setOutput('Please paste a JavaScript or TypeScript function.');
      setIsError(true);
      return;
    }
    setLoading(true);
    setOutput(null);
    setIsError(false);
    try {
      const result = await generateTests(trimmed);
      setOutput(result.success ? result.testCode : result.error);
      setIsError(!result.success);
    } catch (err) {
      setOutput(err.message || 'Request failed. Is the server running?');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleCopy = useCallback(() => {
    if (output && !isError) {
      navigator.clipboard.writeText(output);
    }
  }, [output, isError]);

  const hasOutput = output != null && output !== '';

  return (
    <div className="app">
      <h1>Unit Test Generator</h1>
      <p style={{ color: '#8a8ab0', marginBottom: '1.5rem' }}>
        Paste a JavaScript or TypeScript function below and get a Vitest test suite.
      </p>

      <div className="input-section">
        <label htmlFor="code-input">Your function</label>
        <CodeInput
          value={code}
          onChange={setCode}
          placeholder="function add(a, b) { return a + b; }"
          disabled={loading}
        />
      </div>

      <div className="actions">
        <GenerateButton onClick={handleGenerate} disabled={!code.trim()} loading={loading} />
        {loading && <span className="loading">Waiting for API response…</span>}
      </div>

      <div className="output-section">
        <label htmlFor="code-output">Generated test suite</label>
        <TestOutput
          content={output}
          isError={isError}
          placeholder="Generated Vitest tests will appear here."
        />
        <div className="actions" style={{ marginTop: '0.75rem' }}>
          <CopyButton onClick={handleCopy} hasContent={hasOutput && !isError} />
        </div>
      </div>
    </div>
  );
}
