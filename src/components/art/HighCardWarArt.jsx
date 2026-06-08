export default function HighCardWarArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="hcw-win">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f7bd4a" floodOpacity="0.6"/>
        </filter>
        <filter id="hcw-lose">
          <feDropShadow dx="3" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
        </filter>
      </defs>
      <rect width="145" height="190" fill="#0b0d12"/>
      {/* K♥ — right, losing */}
      <rect x="72" y="42" width="58" height="85" rx="7" fill="#f0f2f8" transform="rotate(8,101,84)" filter="url(#hcw-lose)"/>
      <text x="80" y="65" fill="#f35f76" fontSize="13" fontWeight="900" transform="rotate(8,101,84)">K</text>
      <text x="80" y="80" fill="#f35f76" fontSize="18" transform="rotate(8,101,84)">♥</text>
      <text x="101" y="97" textAnchor="middle" fill="#f35f76" fontSize="22" transform="rotate(8,101,84)">♥</text>
      {/* A♠ — left, winning */}
      <rect x="14" y="38" width="58" height="85" rx="7" fill="#fff" transform="rotate(-8,43,80)" filter="url(#hcw-win)"/>
      <text x="22" y="60" fill="#1a1f2e" fontSize="13" fontWeight="900" transform="rotate(-8,43,80)">A</text>
      <text x="22" y="75" fill="#1a1f2e" fontSize="18" transform="rotate(-8,43,80)">♠</text>
      <text x="43" y="93" textAnchor="middle" fill="#1a1f2e" fontSize="22" transform="rotate(-8,43,80)">♠</text>
      {/* VS */}
      <text x="72" y="98" textAnchor="middle" fill="#364052" fontSize="14" fontWeight="900">VS</text>
      {/* Coin stack */}
      <ellipse cx="72" cy="158" rx="22" ry="8" fill="#c07a00"/>
      <ellipse cx="72" cy="153" rx="22" ry="8" fill="#f7bd4a"/>
      <ellipse cx="72" cy="148" rx="22" ry="8" fill="#f7bd4a"/>
      <text x="72" y="152" textAnchor="middle" fill="#0b0d12" fontSize="8" fontWeight="900">POT</text>
    </svg>
  );
}
