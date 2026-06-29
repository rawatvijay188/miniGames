import { useEffect } from "react";
import { generateSpinKeyframes } from "./reelEasing.js";

/**
 * Hook that injects sine-eased spin keyframes into the document head.
 * Replaces the default linear CSS animations with smooth acceleration/deceleration.
 */
export function useSpinEasing() {
  useEffect(() => {
    // Check if keyframes already injected
    if (document.getElementById("reel-easing-keyframes")) {
      return undefined;
    }

    // Generate keyframes with fine resolution for smooth easing
    const keyframesCSS = generateSpinKeyframes(100);

    // Create and inject style element
    const style = document.createElement("style");
    style.id = "reel-easing-keyframes";
    style.textContent = keyframesCSS;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);
}
