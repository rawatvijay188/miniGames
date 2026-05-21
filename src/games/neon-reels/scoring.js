export function scoreReels(result) {
  const counts = result.reduce((map, symbol) => {
    map[symbol.id] = (map[symbol.id] || 0) + 1;
    return map;
  }, {});

  if (counts.wild === 3) return { multiplier: 10, label: "Triple Wild" };
  if (counts.seven === 3) return { multiplier: 8, label: "Lucky Sevens" };
  if (counts.gem === 3) return { multiplier: 6, label: "Crystal Match" };
  if (Object.values(counts).some((count) => count === 3)) return { multiplier: 4, label: "Triple Match" };
  if (Object.values(counts).some((count) => count === 2)) return { multiplier: 2, label: "Pair Win" };

  return { multiplier: 0, label: "No win" };
}
