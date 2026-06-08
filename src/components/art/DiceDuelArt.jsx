export default function DiceDuelArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      <defs>
        <filter id="dd-shadow">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
        </filter>
      </defs>
      {/* Left die — shows 3 */}
      <rect x="10" y="55" width="52" height="52" rx="8" fill="#f0f2f8" filter="url(#dd-shadow)"/>
      <circle cx="24" cy="69" r="5" fill="#1a1f2e"/>
      <circle cx="36" cy="81" r="5" fill="#f7bd4a"/>
      <circle cx="48" cy="93" r="5" fill="#1a1f2e"/>
      {/* Right die — shows 6 */}
      <rect x="83" y="55" width="52" height="52" rx="8" fill="#f0f2f8" filter="url(#dd-shadow)"/>
      <circle cx="97" cy="68" r="4" fill="#1a1f2e"/>
      <circle cx="109" cy="68" r="4" fill="#1a1f2e"/>
      <circle cx="97" cy="81" r="4" fill="#f7bd4a"/>
      <circle cx="109" cy="81" r="4" fill="#f7bd4a"/>
      <circle cx="97" cy="94" r="4" fill="#1a1f2e"/>
      <circle cx="109" cy="94" r="4" fill="#1a1f2e"/>
      {/* VS */}
      <text x="72" y="86" textAnchor="middle" fill="#364052" fontSize="13" fontWeight="900">VS</text>
      <text x="36" y="125" textAnchor="middle" fill="#9aa6b7" fontSize="11" fontWeight="700">3</text>
      <text x="109" y="125" textAnchor="middle" fill="#f7bd4a" fontSize="11" fontWeight="700">6</text>
    </svg>
  );
}
