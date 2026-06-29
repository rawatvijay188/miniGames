import { sleep } from "../../utils/timing.js";
import { cellDuration } from "./reelEasing.js";

/**
 * Build upward-scrolling reel strips for the spinning animation.
 * Each strip is filled by repeating random grid rows until it reaches the
 * requested length.
 * @param {number} reelCount
 * @param {number} stripLength
 * @param {() => any[][]} randomGridFn
 * @returns {Array<any[]>}
 */
export function buildReelStrips(reelCount, stripLength, randomGridFn) {
  return Array.from({ length: reelCount }, (_, reelIndex) => {
    const strip = [];
    while (strip.length < stripLength) {
      const symbols = randomGridFn().flat();
      for (const symbol of symbols) {
        if (strip.length >= stripLength) break;
        strip.push({ symbol, uid: `${reelIndex}-${strip.length}` });
      }
    }
    return strip;
  });
}

/**
 * Stop the reels one by one, from left to right.
 * @param {object} options
 * @param {number} options.reelCount
 * @param {number} options.firstStopMs
 * @param {number} options.stopGapMs
 * @param {function} options.setRolling
 * @param {function(number):void} [options.onStop]
 */
export async function stopReelsSequentially({ reelCount, firstStopMs, stopGapMs, setRolling, onStop }) {
  setRolling(Array.from({ length: reelCount }, () => true));
  for (let reel = 0; reel < reelCount; reel += 1) {
    await sleep(reel === 0 ? firstStopMs : stopGapMs);
    setRolling((prev) => prev.map((isRolling, i) => (i === reel ? false : isRolling)));
    if (typeof onStop === "function") onStop(reel);
  }
}

/**
 * Animate a reel strip by moving the top visible symbol to the bottom as the
 * strip scrolls up. This performs the attach/detach behavior inside the reel
 * window, and is used by all DOM-based slot reels.
 * @param {HTMLElement} stripEl
 * @param {number} totalSteps
 * @param {number} durationScale
 * @param {function} [onComplete]
 * @returns {function():void} cleanup function
 */
export function animateReelStrip(stripEl, totalSteps, durationScale, onComplete) {
  if (!stripEl || totalSteps <= 0) {
    if (typeof onComplete === "function") onComplete();
    return () => {};
  }

  let timerId = null;
  let cancelled = false;
  let step = 0;

  const cleanup = () => {
    cancelled = true;
    if (timerId !== null) window.clearTimeout(timerId);
  };

  const runStep = () => {
    if (cancelled || step >= totalSteps) {
      if (stripEl) {
        stripEl.style.transition = "none";
        stripEl.style.transform = "translateY(0px)";
      }
      if (!cancelled && typeof onComplete === "function") onComplete();
      return;
    }

    const cell = stripEl.querySelector(".reel-col-cell");
    if (!cell) {
      if (typeof onComplete === "function") onComplete();
      return;
    }

    const duration = cellDuration(step, totalSteps) * durationScale;
    const height = cell.getBoundingClientRect().height;

    stripEl.style.transition = `transform ${duration}ms linear`;
    stripEl.style.transform = `translateY(-${height}px)`;

    timerId = window.setTimeout(() => {
      if (cancelled || !stripEl) {
        cleanup();
        return;
      }
      stripEl.style.transition = "none";
      stripEl.style.transform = "translateY(0px)";
      const firstCell = stripEl.firstElementChild;
      if (firstCell) stripEl.appendChild(firstCell);
      step += 1;
      runStep();
    }, duration + 20);
  };

  runStep();
  return cleanup;
}
