export default function KenoArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      <g fontSize="8" fontWeight="700" textAnchor="middle">
        {/* Row 1 */}
        <circle cx="20" cy="30" r="11" fill="#181d28" stroke="#364052" strokeWidth="1"/><text x="20" y="34" fill="#9aa6b7">1</text>
        <circle cx="44" cy="30" r="11" fill="#181d28" stroke="#364052" strokeWidth="1"/><text x="44" y="34" fill="#9aa6b7">2</text>
        <circle cx="68" cy="30" r="11" fill="#f7bd4a"/><text x="68" y="34" fill="#0b0d12">3</text>
        <circle cx="92" cy="30" r="11" fill="#181d28" stroke="#364052" strokeWidth="1"/><text x="92" y="34" fill="#9aa6b7">4</text>
        <circle cx="116" cy="30" r="11" fill="#f7bd4a"/><text x="116" y="34" fill="#0b0d12">5</text>
        {/* Row 2 */}
        <circle cx="20" cy="58" r="11" fill="#f7bd4a"/><text x="20" y="62" fill="#0b0d12">6</text>
        <circle cx="44" cy="58" r="11" fill="#181d28" stroke="#364052" strokeWidth="1"/><text x="44" y="62" fill="#9aa6b7">7</text>
        <circle cx="68" cy="58" r="11" fill="#181d28" stroke="#364052" strokeWidth="1"/><text x="68" y="62" fill="#9aa6b7">8</text>
        <circle cx="92" cy="58" r="11" fill="#f7bd4a"/><text x="92" y="62" fill="#0b0d12">9</text>
        <circle cx="116" cy="58" r="11" fill="#181d28" stroke="#364052" strokeWidth="1"/><text x="116" y="62" fill="#9aa6b7">10</text>
        {/* Row 3 */}
        <circle cx="20" cy="86" r="11" fill="#181d28" stroke="#49d7df" strokeWidth="1.5"/><text x="20" y="90" fill="#49d7df">11</text>
        <circle cx="44" cy="86" r="11" fill="#f35f76"/><text x="44" y="90" fill="#fff">12</text>
        <circle cx="68" cy="86" r="11" fill="#181d28" stroke="#49d7df" strokeWidth="1.5"/><text x="68" y="90" fill="#49d7df">13</text>
        <circle cx="92" cy="86" r="11" fill="#f7bd4a"/><text x="92" y="90" fill="#0b0d12">14</text>
        <circle cx="116" cy="86" r="11" fill="#181d28" stroke="#364052" strokeWidth="1"/><text x="116" y="90" fill="#9aa6b7">15</text>
        {/* Row 4 */}
        <circle cx="20" cy="114" r="11" fill="#181d28" stroke="#364052" strokeWidth="1"/><text x="20" y="118" fill="#9aa6b7">16</text>
        <circle cx="44" cy="114" r="11" fill="#181d28" stroke="#49d7df" strokeWidth="1.5"/><text x="44" y="118" fill="#49d7df">17</text>
        <circle cx="68" cy="114" r="11" fill="#f35f76"/><text x="68" y="118" fill="#fff">18</text>
        <circle cx="92" cy="114" r="11" fill="#181d28" stroke="#364052" strokeWidth="1"/><text x="92" y="118" fill="#9aa6b7">19</text>
        <circle cx="116" cy="114" r="11" fill="#f7bd4a"/><text x="116" y="118" fill="#0b0d12">20</text>
      </g>
      {/* Legend */}
      <circle cx="22" cy="155" r="5" fill="#f7bd4a"/>
      <text x="30" y="159" fill="#9aa6b7" fontSize="8" textAnchor="start">Drawn</text>
      <circle cx="65" cy="155" r="5" fill="none" stroke="#49d7df" strokeWidth="1.5"/>
      <text x="73" y="159" fill="#9aa6b7" fontSize="8" textAnchor="start">Pick</text>
      <circle cx="100" cy="155" r="5" fill="#f35f76"/>
      <text x="108" y="159" fill="#9aa6b7" fontSize="8" textAnchor="start">Match</text>
    </svg>
  );
}
