export default function ShooterArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      {/* Stars */}
      <circle cx="20" cy="20" r="1.5" fill="#fff" opacity="0.7"/>
      <circle cx="60" cy="10" r="1" fill="#fff" opacity="0.5"/>
      <circle cx="100" cy="30" r="1.5" fill="#fff" opacity="0.8"/>
      <circle cx="130" cy="15" r="1" fill="#fff" opacity="0.4"/>
      <circle cx="40" cy="50" r="1" fill="#fff" opacity="0.6"/>
      <circle cx="115" cy="55" r="1.5" fill="#fff" opacity="0.5"/>
      <circle cx="80" cy="35" r="1" fill="#fff" opacity="0.7"/>
      <circle cx="15" cy="80" r="1" fill="#fff" opacity="0.4"/>
      <circle cx="130" cy="70" r="1.5" fill="#fff" opacity="0.6"/>
      {/* Enemy ships (rose) */}
      <polygon points="30,25 20,50 40,50" fill="#f35f76"/>
      <rect x="22" y="46" width="16" height="5" rx="2" fill="#c04060"/>
      <polygon points="115,25 105,50 125,50" fill="#f35f76"/>
      <rect x="107" y="46" width="16" height="5" rx="2" fill="#c04060"/>
      {/* Laser beam */}
      <line x1="72" y1="140" x2="72" y2="60" stroke="#f7bd4a" strokeWidth="2" opacity="0.7" strokeDasharray="4,3"/>
      {/* Player ship (cyan) */}
      <polygon points="72,170 55,148 89,148" fill="#49d7df"/>
      <rect x="60" y="144" width="24" height="8" rx="3" fill="#2ab0b8"/>
      <circle cx="72" cy="156" r="5" fill="#0b0d12"/>
    </svg>
  );
}
