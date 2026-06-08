export default function NumberRushArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      <defs>
        <filter id="nr2-glow">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="45" cy="90" r="32" fill="#181d28" stroke="#49d7df" strokeWidth="1.5"/>
      <text x="45" y="100" textAnchor="middle" fill="#49d7df" fontSize="36" fontWeight="900">?</text>
      <line x1="82" y1="90" x2="96" y2="90" stroke="#364052" strokeWidth="2"/>
      <polygon points="96,90 90,86 90,94" fill="#364052"/>
      <circle cx="118" cy="90" r="22" fill="#181d28" stroke="#f7bd4a" strokeWidth="2"/>
      <text x="118" y="97" textAnchor="middle" fill="#f7bd4a" fontSize="22" fontWeight="900" filter="url(#nr2-glow)">42</text>
      <rect x="20" y="138" width="105" height="6" rx="3" fill="#181d28"/>
      <rect x="20" y="138" width="63" height="6" rx="3" fill="#49d7df"/>
      <text x="72" y="158" textAnchor="middle" fill="#9aa6b7" fontSize="9">STREAK</text>
    </svg>
  );
}
