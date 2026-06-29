// Prize / odds table (`.paytable`). Pass rows of { label, value }.
//
//   <Paytable rows={[{ label: "Jackpot", value: "50x" }, …]} />
export default function Paytable({ rows, label = "Prizes" }) {
  return (
    <section className="paytable" aria-label={label}>
      {rows.map((row) => (
        <div key={row.label}>
          <span>{row.label}</span>
          <strong>{row.value}</strong>
        </div>
      ))}
    </section>
  );
}
