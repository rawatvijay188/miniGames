export default function Meter({ label, value }) {
  return (
    <div className="meter">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
