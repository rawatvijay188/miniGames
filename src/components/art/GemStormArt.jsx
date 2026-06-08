export default function GemStormArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="gs-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#49d7df" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#49d7df" stopOpacity="0"/>
        </radialGradient>
        <filter id="gs-wild">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="145" height="190" fill="#060c18"/>
      <circle cx="72" cy="90" r="40" fill="url(#gs-glow)"/>
      {/* Left gem (red octagon) */}
      <polygon points="22,72 30,64 42,64 50,72 50,84 42,92 30,92 22,84" fill="#c0392b" stroke="#f35f76" strokeWidth="1.5"/>
      <text x="36" y="83" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900">GEM</text>
      {/* Center diamond (WILD — bigger) */}
      <polygon points="72,52 96,90 72,128 48,90" fill="#49d7df" stroke="#fff" strokeWidth="2" filter="url(#gs-wild)"/>
      <text x="72" y="95" textAnchor="middle" fill="#0b0d12" fontSize="11" fontWeight="900">WILD</text>
      {/* Right gem (blue circle) */}
      <circle cx="118" cy="90" r="20" fill="#3a5bd9" stroke="#7c9ef7" strokeWidth="1.5"/>
      <text x="118" y="95" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900">GEM</text>
      <text x="72" y="175" textAnchor="middle" fill="#49d7df" fontSize="9" fontWeight="800" letterSpacing="0.08em">EXPANDING WILD</text>
    </svg>
  );
}
