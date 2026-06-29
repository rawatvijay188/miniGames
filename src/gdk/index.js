// Mini Games Arcade — Game Development Kit (GDK)
// =============================================
// One import surface for the reusable building blocks every game shares:
// wagering logic, deterministic RNG, sound presets, the betting hooks, and the
// UI chrome (shell, score strip, bet controls, paytable).
//
//   import { useGame, GameShell, ScoreStrip, BetControls, money } from "../../gdk";
//
// Pure logic is tree-shakeable and unit-tested (see *.test.js next to sources).

// ── Logic ──────────────────────────────────────────────────────────────────
export { mulberry32, randInt, pick, weightedPick, shuffle, chance } from "./logic/rng.js";
export { clampBet, DEFAULT_BET } from "./logic/bet.js";
export { settle, settleResult } from "./logic/payout.js";
export * as sfx from "./logic/sfx.js";

// ── Constants ──────────────────────────────────────────────────────────────
export { SPIN, DEAL, CELL_SLOW_MS, CELL_FAST_MS } from "./constants.js";

// ── Spin engine ──────────────────────────────────────────────────────────────
export {
  cellDuration,
  totalSpinTime,
  defaultSpinSteps,
  generateSpinKeyframes,
  EASE_BEZIER,
} from "./spin/reelEasing.js";
export { buildReelStrips, stopReelsSequentially, animateReelStrip } from "./spin/reelSpin.js";
export { default as SpinningReels, toVisualColumns } from "./spin/SpinningReels.jsx";
export { useSpinEasing } from "./spin/useSpinEasing.js";

// ── Hooks ──────────────────────────────────────────────────────────────────
export { useBet } from "./hooks/useBet.js";
export { useSound } from "./hooks/useSound.js";
export { useGame } from "./hooks/useGame.js";
export { useReelSpin } from "./hooks/useReelSpin.js";

// ── UI ─────────────────────────────────────────────────────────────────────
export { default as GameShell } from "./ui/GameShell.jsx";
export { default as ScoreStrip } from "./ui/ScoreStrip.jsx";
export { default as BetControls } from "./ui/BetControls.jsx";
export { default as Paytable } from "./ui/Paytable.jsx";

// ── Re-exported shared primitives (so games need a single import) ────────────
export { money } from "../utils/format.js";
export { sleep } from "../utils/timing.js";
export { navigateTo } from "../utils/navigation.js";
export { playTone } from "../utils/audio.js";
export { useCoins } from "../context/CoinContext.jsx";
