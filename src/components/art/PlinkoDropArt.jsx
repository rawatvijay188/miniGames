export default function PlinkoDropArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      {/* Pegs */}
      <g fill="#9aa6b7">
        <circle cx="72" cy="22" r="3"/>
        <circle cx="54" cy="42" r="3"/><circle cx="90" cy="42" r="3"/>
        <circle cx="36" cy="62" r="3"/><circle cx="72" cy="62" r="3"/><circle cx="108" cy="62" r="3"/>
        <circle cx="18" cy="82" r="3"/><circle cx="54" cy="82" r="3"/><circle cx="90" cy="82" r="3"/><circle cx="126" cy="82" r="3"/>
        <circle cx="36" cy="102" r="3"/><circle cx="72" cy="102" r="3"/><circle cx="108" cy="102" r="3"/>
      </g>
      {/* Ball trail */}
      <circle cx="90" cy="52" r="6" fill="#f35f76" opacity="0.2"/>
      <circle cx="72" cy="72" r="6" fill="#f35f76" opacity="0.4"/>
      <circle cx="90" cy="92" r="7" fill="#f35f76"/>
      {/* Buckets */}
      <rect x="5"  y="126" width="22" height="30" rx="3" fill="#181d28" stroke="#364052" strokeWidth="1"/>
      <text x="16"  y="146" textAnchor="middle" fill="#9aa6b7" fontSize="8" fontWeight="700">1×</text>
      <rect x="32" y="126" width="22" height="30" rx="3" fill="#181d28" stroke="#364052" strokeWidth="1"/>
      <text x="43"  y="146" textAnchor="middle" fill="#9aa6b7" fontSize="8" fontWeight="700">5×</text>
      <rect x="59" y="120" width="26" height="36" rx="3" fill="#181d28" stroke="#f7bd4a" strokeWidth="2"/>
      <text x="72"  y="143" textAnchor="middle" fill="#f7bd4a" fontSize="9" fontWeight="900">18×</text>
      <rect x="90" y="126" width="22" height="30" rx="3" fill="#181d28" stroke="#364052" strokeWidth="1"/>
      <text x="101" y="146" textAnchor="middle" fill="#9aa6b7" fontSize="8" fontWeight="700">5×</text>
      <rect x="117" y="126" width="22" height="30" rx="3" fill="#181d28" stroke="#364052" strokeWidth="1"/>
      <text x="128" y="146" textAnchor="middle" fill="#9aa6b7" fontSize="8" fontWeight="700">1×</text>
    </svg>
  );
}
