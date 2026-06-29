// Shared game constants for the Mini Games Arcade GDK.
//
// Values that more than one game needs (or that a designer might want to tune
// in one place) live here instead of being re-declared per game. Bet sizing
// lives in logic/bet.js (DEFAULT_BET); this file covers animation pacing.

import { CELL_SLOW_MS, CELL_FAST_MS } from "./spin/reelEasing.js";

// Re-export the reel easing pacing so games import all spin tuning from one place.
export { CELL_SLOW_MS, CELL_FAST_MS };

// Reel-spin pacing shared by the DOM grid slots (Gem Storm, Fruit Frenzy,
// Cosmic Cascade). Individual games may override via useReelSpin() options.
export const SPIN = Object.freeze({
  stripLen: 12, // random symbols per reel during the scroll
  firstStopMs: 520, // delay before the first reel stops
  stopGapMs: 210, // extra delay before each later reel stops
  revealMs: 240, // settle pause before the result grid is shown
  durationScale: 0.34, // CSS reel-roll duration scale ("--reel-roll-duration")
});

// Card/hand dealing pacing for the table games.
export const DEAL = Object.freeze({
  dealMs: 320, // pause between dealt cards
});
