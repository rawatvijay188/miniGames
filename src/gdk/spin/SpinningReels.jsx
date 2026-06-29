import { useEffect, useRef } from "react";
import { animateReelStrip } from "./reelSpin.js";

// Shared upward-scrolling reels for the DOM/grid-based slots (Gem Storm,
// Fruit Frenzy, Cosmic Cascade). During a spin each visual column scrolls a
// looping strip of random symbols; when a column stops it snaps to its real
// result symbols so revealing the grid is seamless.
//
// This component performs attach/detach symbol movement inside the reel window
// for each spin step.

// Reshapes a flat list of symbols (in the exact order a game maps cells into
// its grid) into per-column arrays, top → bottom. This matches however the
// grid lays cells out, so stopped reels line up with the revealed result.
export function toVisualColumns(flatSymbols, columnCount) {
  const rowCount = flatSymbols.length / columnCount;
  return Array.from({ length: columnCount }, (_, col) =>
    Array.from({ length: rowCount }, (_, row) => flatSymbols[row * columnCount + col])
  );
}

export default function SpinningReels({ columns = [], strips = [], rolling = [], rows, spinSteps = [], durationScale = 0.34 }) {
  const stripRefs = useRef([]);
  const timerIds = useRef([]);

  useEffect(() => {
    timerIds.current.forEach((cleanup) => cleanup?.());
    timerIds.current = [];

    strips.forEach((_, col) => {
      const stripEl = stripRefs.current[col];
      if (!stripEl || !rolling[col]) return;

      const totalSteps = Number.isInteger(spinSteps[col]) ? spinSteps[col] : Math.max(8, strips[col]?.length || 8);
      const cleanup = animateReelStrip(stripEl, totalSteps, durationScale);
      timerIds.current[col] = cleanup;
    });

    return () => timerIds.current.forEach((cleanup) => cleanup?.());
  }, [strips, rolling.map(String).join(","), spinSteps.map(String).join(","), durationScale]);

  if (!Array.isArray(columns) || columns.length === 0) {
    console.warn("SpinningReels: missing or empty columns", { columns, strips, rolling, rows, spinSteps });
    return null;
  }

  return columns.map((resultColumn, col) => (
    <div
      className={`reel-col ${rolling[col] ? "is-rolling" : "is-stopped"}`}
      key={col}
      style={{ aspectRatio: `1 / ${rows}` }}
    >
      {rolling[col] ? (
        // Duplicated strip so the upward scroll loops seamlessly.
        <div
          className="reel-col-strip"
          ref={(el) => { stripRefs.current[col] = el; }}
          style={{ animation: "none" }}
        >
          {[...strips[col], ...strips[col]].map((cell, i) => (
            <div className="reel-col-cell" key={`${cell.uid}-${i}`}>
              <span dangerouslySetInnerHTML={{ __html: cell.symbol.svg }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="reel-col-strip is-final">
          {resultColumn.map((symbol, i) => (
            <div className="reel-col-cell" key={i}>
              <span dangerouslySetInnerHTML={{ __html: symbol.svg }} />
            </div>
          ))}
        </div>
      )}
    </div>
  ));
}
