export default function FruitFrenzyArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      {/* Row 1 */}
      <rect x="8" y="18" width="38" height="38" rx="6" fill="#1a1020" stroke="#f35f76" strokeWidth="2"/>
      <text x="27" y="43" textAnchor="middle" fill="#f35f76" fontSize="22">🍒</text>
      <rect x="53" y="18" width="38" height="38" rx="6" fill="#1a1020" stroke="#f35f76" strokeWidth="2"/>
      <text x="72" y="43" textAnchor="middle" fill="#f35f76" fontSize="22">🍒</text>
      <rect x="98" y="18" width="38" height="38" rx="6" fill="#1a1020"/>
      <text x="117" y="43" textAnchor="middle" fill="#f7bd4a" fontSize="22">🍌</text>
      {/* Row 2 */}
      <rect x="8" y="62" width="38" height="38" rx="6" fill="#1a1020" stroke="#f35f76" strokeWidth="2"/>
      <text x="27" y="87" textAnchor="middle" fill="#f35f76" fontSize="22">🍒</text>
      <rect x="53" y="62" width="38" height="38" rx="6" fill="#1a1020" stroke="#f35f76" strokeWidth="2"/>
      <text x="72" y="87" textAnchor="middle" fill="#f35f76" fontSize="22">🍒</text>
      <rect x="98" y="62" width="38" height="38" rx="6" fill="#1a1020"/>
      <text x="117" y="87" textAnchor="middle" fill="#70d67a" fontSize="22">🍉</text>
      {/* Row 3 */}
      <rect x="8" y="106" width="38" height="38" rx="6" fill="#1a1020" stroke="#f35f76" strokeWidth="2"/>
      <text x="27" y="131" textAnchor="middle" fill="#f35f76" fontSize="22">🍒</text>
      <rect x="53" y="106" width="38" height="38" rx="6" fill="#1a1020"/>
      <text x="72" y="131" textAnchor="middle" fill="#70d67a" fontSize="22">🍉</text>
      <rect x="98" y="106" width="38" height="38" rx="6" fill="#1a1020"/>
      <text x="117" y="131" textAnchor="middle" fill="#f7bd4a" fontSize="22">🍌</text>
      {/* Cluster highlight */}
      <rect x="5" y="15" width="44" height="132" rx="6" fill="none" stroke="#f35f76" strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
      <text x="27" y="163" textAnchor="middle" fill="#f35f76" fontSize="9" fontWeight="800">5× CLUSTER</text>
    </svg>
  );
}
