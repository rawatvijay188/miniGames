/**
 * Shared reel spinning easing logic — used across all slot games.
 * Provides smooth acceleration/deceleration (slow → fast → slow).
 */

// Reel spin pacing: time to scroll one cell eases slow → fast → slow
export const CELL_SLOW_MS = 340; // slowest one-cell slide (ms) at the start and end
export const CELL_FAST_MS = 95; // fastest one-cell slide (ms) at mid-spin
export const DEFAULT_SPIN_STEPS = 10;
export const SPIN_STEP_INCREMENT = 4;

/**
 * Calculate the duration for a single cell at a given step.
 * Uses sine easing: slow start → fast middle → slow end.
 * @param {number} step - Current step (0-based)
 * @param {number} totalCells - Total cells to scroll
 * @returns {number} Duration in milliseconds for this cell
 */
export function cellDuration(step, totalCells) {
  if (totalCells <= 1) return 0;
  const t = step / (totalCells - 1); // 0 to 1
  const easeMultiplier = Math.sin(Math.PI * t); // 0 at ends, 1 in middle
  return CELL_SLOW_MS - (CELL_SLOW_MS - CELL_FAST_MS) * easeMultiplier;
}

/**
 * Calculate total spin time for all cells.
 * @param {number} totalCells - Total cells to scroll
 * @returns {number} Total duration in milliseconds
 */
export function totalSpinTime(totalCells) {
  let total = 0;
  for (let step = 0; step < totalCells; step += 1) {
    total += cellDuration(step, totalCells);
  }
  return total;
}

/**
 * Create a default per-reel step count for the desired number of reels.
 * The later reels spin longer so they land left to right.
 */
export function defaultSpinSteps(reelCount) {
  return Array.from({ length: reelCount }, (_, index) => DEFAULT_SPIN_STEPS + index * SPIN_STEP_INCREMENT);
}

/**
 * CSS cubic-bezier approximation of sine ease-in-out.
 * Best matches Math.sin(Math.PI * t) easing for smooth acceleration.
 * Used as a fallback for CSS animations.
 */
export const EASE_BEZIER = "cubic-bezier(0.35, 0, 0.65, 1)";

/**
 * Generate keyframes for a more accurate sine-curve spin.
 * Can be injected into CSS for perfect animation timing.
 * @param {number} keyframeCount - Number of keyframes to generate (20-100 recommended)
 * @returns {string} CSS keyframes animation
 */
export function generateSpinKeyframes(keyframeCount = 50) {
  let keyframes = "@keyframes reel-spin-eased {\n";
  for (let i = 0; i <= keyframeCount; i += 1) {
    const percent = (i / keyframeCount) * 100;
    const t = i / keyframeCount; // 0 to 1
    // Calculate translateY based on sine easing
    const easeMultiplier = Math.sin(Math.PI * t);
    const translateY = -50 * easeMultiplier; // -50% at end, 0 at start
    keyframes += `  ${percent.toFixed(1)}% { transform: translateY(${translateY.toFixed(2)}%); }\n`;
  }
  keyframes += "}";
  return keyframes;
}
