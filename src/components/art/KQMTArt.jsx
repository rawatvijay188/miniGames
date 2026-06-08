export default function KQMTArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      {/* King (gold) */}
      <rect x="10" y="30" width="58" height="58" rx="8" fill="#181d28" stroke="#f7bd4a" strokeWidth="2"/>
      <text x="39" y="68" textAnchor="middle" fill="#f7bd4a" fontSize="30">♚</text>
      <text x="39" y="83" textAnchor="middle" fill="#f7bd4a" fontSize="8" fontWeight="800" letterSpacing="0.05em">KING</text>
      {/* Queen (rose) */}
      <rect x="76" y="30" width="58" height="58" rx="8" fill="#181d28" stroke="#f35f76" strokeWidth="1.5"/>
      <text x="105" y="68" textAnchor="middle" fill="#f35f76" fontSize="30">♕</text>
      <text x="105" y="83" textAnchor="middle" fill="#f35f76" fontSize="8" fontWeight="800" letterSpacing="0.05em">QUEEN</text>
      {/* Minister (cyan) */}
      <rect x="10" y="96" width="58" height="58" rx="8" fill="#181d28" stroke="#49d7df" strokeWidth="1.5"/>
      <text x="39" y="133" textAnchor="middle" fill="#49d7df" fontSize="28">⚑</text>
      <text x="39" y="149" textAnchor="middle" fill="#49d7df" fontSize="8" fontWeight="800" letterSpacing="0.05em">MINISTER</text>
      {/* Thief (muted) */}
      <rect x="76" y="96" width="58" height="58" rx="8" fill="#181d28" stroke="#364052" strokeWidth="1.5"/>
      <text x="105" y="133" textAnchor="middle" fill="#9aa6b7" fontSize="28">🕵</text>
      <text x="105" y="149" textAnchor="middle" fill="#9aa6b7" fontSize="8" fontWeight="800" letterSpacing="0.05em">THIEF</text>
    </svg>
  );
}
