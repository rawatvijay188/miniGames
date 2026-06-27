export default function NeonSnakeDuelArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      {/* Red snake trail with right-angle turns, arrow head pointing up */}
      <g fill="none" stroke="#f35f76" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M30 150 H64 V112 H46 V84"/>
      </g>
      <path d="M46 72 l-7 12 h14 z" fill="#f35f76"/>
      {/* Blue snake trail interlocking, arrow head pointing down */}
      <g fill="none" stroke="#4a90f7" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M115 150 H81 V96 H99 V120"/>
      </g>
      <path d="M99 132 l-7 -12 h14 z" fill="#4a90f7"/>
      {/* A second blue stroke for the twin-line look */}
      <g fill="none" stroke="#4a90f7" strokeWidth="5" strokeLinecap="square">
        <path d="M70 60 V108"/>
      </g>
      <path d="M70 50 l-7 12 h14 z" fill="#4a90f7"/>
    </svg>
  );
}
