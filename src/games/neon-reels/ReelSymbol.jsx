export default function ReelSymbol({ symbol }) {
  return (
    <div className="symbol" aria-label={symbol.name} style={{ color: symbol.color || "" }}>
      {symbol.svg ? <span dangerouslySetInnerHTML={{ __html: symbol.svg }} /> : symbol.text}
    </div>
  );
}
