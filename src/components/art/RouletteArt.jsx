export default function RouletteArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      <g transform="translate(72,100)">
        <path d="M0,0 L0,-65 A65,65 0 0,1 56.3,-32.5 Z" fill="#c0392b"/>
        <path d="M0,0 L56.3,-32.5 A65,65 0 0,1 65,0 Z" fill="#1a1f2e"/>
        <path d="M0,0 L65,0 A65,65 0 0,1 56.3,32.5 Z" fill="#c0392b"/>
        <path d="M0,0 L56.3,32.5 A65,65 0 0,1 0,65 Z" fill="#1a1f2e"/>
        <path d="M0,0 L0,65 A65,65 0 0,1 -56.3,32.5 Z" fill="#c0392b"/>
        <path d="M0,0 L-56.3,32.5 A65,65 0 0,1 -65,0 Z" fill="#1a1f2e"/>
        <path d="M0,0 L-65,0 A65,65 0 0,1 -56.3,-32.5 Z" fill="#c0392b"/>
        <path d="M0,0 L-56.3,-32.5 A65,65 0 0,1 0,-65 Z" fill="#1a1f2e"/>
        <circle r="65" fill="none" stroke="#f7bd4a" strokeWidth="2"/>
        <circle r="46" fill="none" stroke="#364052" strokeWidth="1"/>
        <circle r="28" fill="#0f1520" stroke="#364052" strokeWidth="1"/>
        <circle r="12" fill="#f7bd4a"/>
        <text y="4" textAnchor="middle" fill="#0b0d12" fontSize="9" fontWeight="900">0</text>
        {/* numbers */}
        <text x="0" y="-53" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">32</text>
        <text x="53" y="4" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">15</text>
        <text x="0" y="60" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">26</text>
        <text x="-53" y="4" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">3</text>
      </g>
      {/* Ball */}
      <circle cx="72" cy="38" r="5" fill="#f0f2f8" stroke="#ccc" strokeWidth="1"/>
      {/* Pointer */}
      <polygon points="72,32 68,22 76,22" fill="#f7bd4a"/>
    </svg>
  );
}
