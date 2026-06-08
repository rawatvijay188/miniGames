export default function CosmicCascadeArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="cc-nebula" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#49d7df" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#0b0d12" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="145" height="190" fill="#060a18"/>
      <circle cx="72" cy="80" r="65" fill="url(#cc-nebula)"/>
      {/* Row 1 — matched (gold highlight) */}
      <rect x="10" y="20" width="36" height="36" rx="6" fill="#1a2740" stroke="#f7bd4a" strokeWidth="1.5"/>
      <text x="28" y="44" textAnchor="middle" fill="#f7bd4a" fontSize="20">★</text>
      <rect x="54" y="20" width="36" height="36" rx="6" fill="#1a2740" stroke="#f7bd4a" strokeWidth="1.5"/>
      <text x="72" y="44" textAnchor="middle" fill="#f7bd4a" fontSize="20">★</text>
      <rect x="98" y="20" width="36" height="36" rx="6" fill="#1a2740" stroke="#f7bd4a" strokeWidth="1.5"/>
      <text x="116" y="44" textAnchor="middle" fill="#f7bd4a" fontSize="20">★</text>
      {/* Row 2 */}
      <rect x="10" y="62" width="36" height="36" rx="6" fill="#0f1520"/>
      <text x="28" y="86" textAnchor="middle" fill="#49d7df" fontSize="20">🚀</text>
      <rect x="54" y="62" width="36" height="36" rx="6" fill="#0f1520"/>
      <text x="72" y="86" textAnchor="middle" fill="#f35f76" fontSize="20">👾</text>
      <rect x="98" y="62" width="36" height="36" rx="6" fill="#0f1520"/>
      <text x="116" y="86" textAnchor="middle" fill="#49d7df" fontSize="20">🚀</text>
      {/* Row 3 */}
      <rect x="10" y="104" width="36" height="36" rx="6" fill="#0f1520"/>
      <text x="28" y="128" textAnchor="middle" fill="#f35f76" fontSize="20">👾</text>
      <rect x="54" y="104" width="36" height="36" rx="6" fill="#0f1520"/>
      <text x="72" y="128" textAnchor="middle" fill="#f7bd4a" fontSize="20">★</text>
      <rect x="98" y="104" width="36" height="36" rx="6" fill="#0f1520"/>
      <text x="116" y="128" textAnchor="middle" fill="#49d7df" fontSize="20">🚀</text>
      <text x="72" y="172" textAnchor="middle" fill="#364052" fontSize="10" fontWeight="800" letterSpacing="0.05em">▼ CASCADE</text>
    </svg>
  );
}
