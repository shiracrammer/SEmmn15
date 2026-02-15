export function GenerateButton({ onClick, disabled, loading }) {
  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? 'Generating…' : 'Generate tests'}
    </button>
  );
}
