export default function ScratchCardArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="sc-foil" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="#d4c8b8" opacity="0.5"/>
        </pattern>
      </defs>
      <rect width="145" height="190" fill="#0b0d12"/>
      {/* Card body */}
      <rect x="12" y="20" width="120" height="150" rx="8" fill="#c8b8a0"/>
      <rect x="12" y="20" width="120" height="150" rx="8" fill="url(#sc-foil)"/>
      {/* Scratch marks */}
      <line x1="20" y1="35" x2="80" y2="42" stroke="#fff" strokeWidth="2.5" opacity="0.7" strokeLinecap="round"/>
      <line x1="25" y1="48" x2="95" y2="38" stroke="#fff" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
      <line x1="30" y1="58" x2="70" y2="52" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round"/>
      <line x1="55" y1="65" x2="120" y2="58" stroke="#fff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
      {/* 3 reveal windows */}
      <rect x="18" y="80" width="32" height="56" rx="5" fill="#0b0d12"/>
      <text x="34" y="115" textAnchor="middle" fill="#f7bd4a" fontSize="26">💎</text>
      <rect x="56" y="80" width="32" height="56" rx="5" fill="#0b0d12"/>
      <text x="72" y="115" textAnchor="middle" fill="#f7bd4a" fontSize="26">💎</text>
      <rect x="94" y="80" width="32" height="56" rx="5" fill="#0b0d12"/>
      <text x="110" y="115" textAnchor="middle" fill="#f7bd4a" fontSize="26">💎</text>
      {/* WIN banner */}
      <rect x="30" y="148" width="85" height="16" rx="8" fill="#f7bd4a"/>
      <text x="72" y="160" textAnchor="middle" fill="#0b0d12" fontSize="9" fontWeight="900">50× JACKPOT!</text>
    </svg>
  );
}
