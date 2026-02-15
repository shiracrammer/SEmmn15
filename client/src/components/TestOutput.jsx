export function TestOutput({ content, isError, placeholder }) {
  if (content === null || content === undefined) {
    return (
      <textarea
        id="code-output"
        className="code-output"
        readOnly
        value=""
        placeholder={placeholder}
        aria-label="Generated test code output"
      />
    );
  }
  return (
    <textarea
      id="code-output"
      className={`code-output ${isError ? 'error' : ''}`}
      readOnly
      value={content}
      aria-label="Generated test code output"
    />
  );
}
