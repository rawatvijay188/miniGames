const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

export const NUMBERS = Array.from({ length: 37 }, (_, i) => i); // 0–36

export function numColor(n) {
  if (n === 0) return "green";
  return RED_NUMBERS.has(n) ? "red" : "black";
}

export const OUTSIDE_BETS = [
  { id: "red",   label: "Red",   theme: "red"     },
  { id: "black", label: "Black", theme: "black"   },
  { id: "odd",   label: "Odd",   theme: "neutral" },
  { id: "even",  label: "Even",  theme: "neutral" },
  { id: "low",   label: "1–18",  theme: "neutral" },
  { id: "high",  label: "19–36", theme: "neutral" },
];

export function spinWheel() {
  return Math.floor(Math.random() * 37);
}

// Returns multiplier applied to bet: 35 for straight-up hit, 1 for outside hit, -1 for loss.
export function settle(bet, result) {
  if (typeof bet === "number") {
    return bet === result ? 35 : -1;
  }
  const color = numColor(result);
  switch (bet) {
    case "red":   return color === "red"   ? 1 : -1;
    case "black": return color === "black" ? 1 : -1;
    case "odd":   return result > 0 && result % 2 === 1 ? 1 : -1;
    case "even":  return result > 0 && result % 2 === 0 ? 1 : -1;
    case "low":   return result >= 1 && result <= 18 ? 1 : -1;
    case "high":  return result >= 19 ? 1 : -1;
    default:      return -1;
  }
}
