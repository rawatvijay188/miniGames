export const faceMarkup = {
  1: ["empty", "empty", "empty", "empty", "dot", "empty", "empty", "empty", "empty"],
  2: ["dot", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "dot"],
  3: ["dot", "empty", "empty", "empty", "dot", "empty", "empty", "empty", "dot"],
  4: ["dot", "empty", "dot", "empty", "empty", "empty", "dot", "empty", "dot"],
  5: ["dot", "empty", "dot", "empty", "dot", "empty", "dot", "empty", "dot"],
  6: ["dot", "empty", "dot", "dot", "empty", "dot", "dot", "empty", "dot"]
};

export const dieFaces = {
  1: "front",
  2: "back",
  3: "right",
  4: "left",
  5: "top",
  6: "bottom"
};

export const rotations = {
  1: "rotateX(0deg) rotateY(0deg)",
  2: "rotateY(180deg)",
  3: "rotateY(-90deg)",
  4: "rotateY(90deg)",
  5: "rotateX(-90deg)",
  6: "rotateX(90deg)"
};

export function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

export function randomSpin() {
  return `rotateX(${720 + Math.random() * 360}deg) rotateY(${720 + Math.random() * 360}deg)`;
}
