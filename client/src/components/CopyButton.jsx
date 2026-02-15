export function CopyButton({ onClick, disabled, hasContent }) {
  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={onClick}
      disabled={disabled || !hasContent}
      aria-label="Copy generated test code"
    >
      Copy
    </button>
  );
}
