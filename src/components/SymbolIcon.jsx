/**
 * Renders a game symbol — either an inline SVG string or plain text/emoji fallback.
 * Usage: <SymbolIcon symbol={sym} />
 */
export default function SymbolIcon({ symbol, className = "" }) {
  if (symbol.svg) {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: symbol.svg }}
        aria-label={symbol.name || symbol.id}
        role="img"
      />
    );
  }
  return (
    <span className={className} aria-label={symbol.name || symbol.id} role="img">
      {symbol.emoji ?? symbol.text ?? "?"}
    </span>
  );
}
