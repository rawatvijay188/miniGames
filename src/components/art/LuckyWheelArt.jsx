export default function LuckyWheelArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      <g transform="translate(72,103)">
        <path d="M0,0 L0,-72 A72,72 0 0,1 50.9,-51.9 Z" fill="#f7bd4a"/>
        <text transform="rotate(18) translate(0,-55)" textAnchor="middle" fill="#0b0d12" fontSize="9" fontWeight="900">50×</text>
        <path d="M0,0 L50.9,-51.9 A72,72 0 0,1 72,0 Z" fill="#f35f76"/>
        <text transform="rotate(54) translate(0,-55)" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="900">2×</text>
        <path d="M0,0 L72,0 A72,72 0 0,1 50.9,51.9 Z" fill="#f7bd4a"/>
        <text transform="rotate(90) translate(0,-55)" textAnchor="middle" fill="#0b0d12" fontSize="9" fontWeight="900">10×</text>
        <path d="M0,0 L50.9,51.9 A72,72 0 0,1 0,72 Z" fill="#f35f76"/>
        <text transform="rotate(126) translate(0,-55)" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="900">5×</text>
        <path d="M0,0 L0,72 A72,72 0 0,1 -50.9,51.9 Z" fill="#f7bd4a"/>
        <text transform="rotate(162) translate(0,-55)" textAnchor="middle" fill="#0b0d12" fontSize="9" fontWeight="900">20×</text>
        <path d="M0,0 L-50.9,51.9 A72,72 0 0,1 -72,0 Z" fill="#f35f76"/>
        <text transform="rotate(198) translate(0,-55)" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="900">3×</text>
        <path d="M0,0 L-72,0 A72,72 0 0,1 -50.9,-51.9 Z" fill="#f7bd4a"/>
        <text transform="rotate(234) translate(0,-55)" textAnchor="middle" fill="#0b0d12" fontSize="9" fontWeight="900">15×</text>
        <path d="M0,0 L-50.9,-51.9 A72,72 0 0,1 0,-72 Z" fill="#f35f76"/>
        <text transform="rotate(270) translate(0,-55)" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="900">1×</text>
        <circle r="72" fill="none" stroke="#f7bd4a" strokeWidth="2"/>
        <circle r="18" fill="#181d28" stroke="#f7bd4a" strokeWidth="2"/>
        <circle r="6" fill="#f7bd4a"/>
      </g>
      {/* Pointer */}
      <polygon points="72,25 65,13 79,13" fill="#fff"/>
    </svg>
  );
}
