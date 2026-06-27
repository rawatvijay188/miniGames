export default function TicTacToeArt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 145 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="145" height="190" fill="#0b0d12"/>
      {/* Grid lines */}
      <g stroke="#364052" strokeWidth="3" strokeLinecap="round">
        <line x1="58" y1="58" x2="58" y2="148"/>
        <line x1="88" y1="58" x2="88" y2="148"/>
        <line x1="28" y1="88" x2="118" y2="88"/>
        <line x1="28" y1="118" x2="118" y2="118"/>
      </g>
      {/* X marks (cyan) */}
      <g stroke="#49d7df" strokeWidth="4.5" strokeLinecap="round">
        <line x1="36" y1="66" x2="50" y2="80"/>
        <line x1="50" y1="66" x2="36" y2="80"/>
        <line x1="96" y1="96" x2="110" y2="110"/>
        <line x1="110" y1="96" x2="96" y2="110"/>
      </g>
      {/* O marks (gold) */}
      <g fill="none" stroke="#f7bd4a" strokeWidth="4.5">
        <circle cx="73" cy="73" r="8"/>
        <circle cx="43" cy="133" r="8"/>
      </g>
      {/* Winning diagonal highlight */}
      <line x1="34" y1="64" x2="112" y2="142" stroke="#70d67a" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
    </svg>
  );
}
