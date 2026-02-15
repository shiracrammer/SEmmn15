export function CodeInput({ value, onChange, placeholder, disabled }) {
  return (
    <textarea
      id="code-input"
      className="code-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      aria-label="Function code input"
      spellCheck="false"
    />
  );
}
