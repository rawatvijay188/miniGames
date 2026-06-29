// The horizontal stat row under the header (Balance / Bet / Result …). Pass an
// array of { label, value } and it renders the existing `.score-strip` markup.
//
//   <ScoreStrip
//     items={[
//       { label: "Balance", value: money(balance) },
//       { label: "Bet", value: money(bet) },
//       { label: "Last Win", value: money(lastWin) },
//     ]}
//   />
export default function ScoreStrip({ items, label = "Status" }) {
  return (
    <section className="score-strip" aria-label={label}>
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
