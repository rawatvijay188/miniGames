import { useCallback, useState } from "react";
import { toVisualColumns } from "../spin/SpinningReels.jsx";
import { buildReelStrips, stopReelsSequentially } from "../spin/reelSpin.js";
import { defaultSpinSteps } from "../spin/reelEasing.js";
import { useSpinEasing } from "../spin/useSpinEasing.js";
import { sleep } from "../../utils/timing.js";
import { SPIN } from "../constants.js";

/**
 * Standard spin orchestration for the DOM grid slots (Gem Storm, Fruit Frenzy,
 * Cosmic Cascade). These games all decide the result grid up front, then scroll
 * looping reels that come to rest left-to-right on that result. That whole
 * dance — build strips, animate, stop sequentially, pause, reveal — used to be
 * copy-pasted into each game; it lives here now.
 *
 *   const { reelSpin, rolling, spinSteps, render, spin } = useReelSpin({
 *     cols: COLS, rows: ROWS, randomGrid,
 *     flatten: (g) => { const f = []; for (r) for (c) f.push(g[r][c]); return f; },
 *     onStop: (c) => sfx.tick(c),
 *   });
 *
 *   // in the spin handler, after deciding `working = randomGrid()`:
 *   await spin(working);   // resolves once the reels have stopped + revealed
 *
 *   // in JSX, where the grid would render:
 *   {reelSpin ? render() : grid.map(...)}
 *
 * `flatten` must list the result symbols in the exact order the game maps cells
 * into its grid, so stopped reels line up with the revealed result.
 *
 * @param {object} opts
 * @param {number} opts.cols
 * @param {number} opts.rows
 * @param {() => any[][]} opts.randomGrid
 * @param {(grid: any[][]) => any[]} opts.flatten
 * @param {(reelIndex: number) => void} [opts.onStop]
 * @param {number} [opts.stripLen]
 * @param {number} [opts.firstStopMs]
 * @param {number} [opts.stopGapMs]
 * @param {number} [opts.revealMs]
 * @param {number} [opts.durationScale]
 */
export function useReelSpin({
  cols,
  rows,
  randomGrid,
  flatten,
  onStop,
  stripLen = SPIN.stripLen,
  firstStopMs = SPIN.firstStopMs,
  stopGapMs = SPIN.stopGapMs,
  revealMs = SPIN.revealMs,
  durationScale = SPIN.durationScale,
}) {
  // Inject the shared sine-eased keyframes once.
  useSpinEasing();

  const [reelSpin, setReelSpin] = useState(null);
  const [rolling, setRolling] = useState([]);
  const [spinSteps, setSpinSteps] = useState([]);

  // Scroll the reels and land on `resultGrid`. After the reveal pause, `apply`
  // runs (the game swaps its grid state to the result) and then the spin
  // overlay clears — in that order, so the real grid is on screen before the
  // scrolling reels disappear (no one-frame flash of the old grid).
  const spin = useCallback(
    async (resultGrid, apply) => {
      const flat = flatten(resultGrid);
      setReelSpin({
        columns: toVisualColumns(flat, cols),
        strips: buildReelStrips(cols, stripLen, randomGrid),
      });
      setSpinSteps(defaultSpinSteps(cols));

      await stopReelsSequentially({ reelCount: cols, firstStopMs, stopGapMs, setRolling, onStop });
      await sleep(revealMs);

      apply?.();
      setReelSpin(null);
      setRolling([]);
      setSpinSteps([]);
    },
    [cols, stripLen, randomGrid, flatten, onStop, firstStopMs, stopGapMs, revealMs]
  );

  return { reelSpin, rolling, spinSteps, spin, rows, durationScale };
}
