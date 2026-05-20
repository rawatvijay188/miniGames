import Die from "./Die.jsx";

export default function DiceSide({ label, values, rolling }) {
  return (
    <div className="dice-side">
      <span>{label}</span>
      <div className="dice-row">
        {values.map((value, index) => (
          <Die value={value} rolling={rolling} key={index} />
        ))}
      </div>
    </div>
  );
}
