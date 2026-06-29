// The shared bet stepper + range + action button row (`.mini-controls`). Wire
// it straight to a useBet()/useGame() instance.
//
//   <BetControls
//     bet={bet} min={min} max={max} step={step}
//     onDecrease={decrease} onIncrease={increase} onChange={setBet}
//     atMin={atMin} atMax={atMax} canBet={canBet} busy={busy}
//     actionLabel="Spin" onAction={spin}
//   />
export default function BetControls({
  bet,
  min,
  max,
  step,
  onDecrease,
  onIncrease,
  onChange,
  atMin,
  atMax,
  canBet,
  busy = false,
  actionLabel,
  onAction,
  noFundsLabel = "No funds",
  label = "Bet controls",
}) {
  return (
    <section className="mini-controls" aria-label={label}>
      <button
        className="stepper"
        type="button"
        onClick={onDecrease}
        disabled={busy || atMin}
        aria-label="Decrease bet"
      >
        -
      </button>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={bet}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Bet amount"
        disabled={busy}
      />
      <button
        className="stepper"
        type="button"
        onClick={onIncrease}
        disabled={busy || atMax}
        aria-label="Increase bet"
      >
        +
      </button>
      <button
        className="spin-button"
        type="button"
        onClick={onAction}
        disabled={busy || !canBet}
      >
        {canBet ? actionLabel : noFundsLabel}
      </button>
    </section>
  );
}
