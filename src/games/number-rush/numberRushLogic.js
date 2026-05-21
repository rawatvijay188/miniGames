export const MIN_ALLOWED_RANGE = 1;
export const MAX_ALLOWED_RANGE = 1000;
export const STARTING_ATTEMPTS = 6;

export function isValidRange(minRange, maxRange) {
  return (
    Number.isInteger(minRange) &&
    Number.isInteger(maxRange) &&
    minRange >= MIN_ALLOWED_RANGE &&
    maxRange <= MAX_ALLOWED_RANGE &&
    minRange < maxRange
  );
}

export function pickTarget(minRange, maxRange) {
  return Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
}
