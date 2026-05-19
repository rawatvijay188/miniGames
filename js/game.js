function score(result) {
  const ids = result.map((symbol) => symbol.id);
  const counts = ids.reduce((map, id) => {
    map[id] = (map[id] || 0) + 1;
    return map;
  }, {});

  if (counts.wild === 3) return { multiplier: 10, label: "Triple Wild" };
  if (counts.seven === 3) return { multiplier: 8, label: "Lucky Sevens" };
  if (counts.gem === 3) return { multiplier: 6, label: "Crystal Match" };

  const hasThree = Object.values(counts).some((count) => count === 3);
  if (hasThree) return { multiplier: 4, label: "Triple Match" };

  const hasPair = Object.values(counts).some((count) => count === 2);
  if (hasPair) return { multiplier: 2, label: "Pair Win" };

  return { multiplier: 0, label: "No win" };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function spin() {
  if (spinning || balance < bet) return;

  spinning = true;
  balance -= bet;
  lastWinEl.textContent = "$0";
  banner.textContent = "Spinning";
  banner.classList.remove("is-win");
  reelEls.forEach((reel) => {
    reel.classList.remove("is-winning");
    reel.classList.add("is-spinning");
  });
  updateMeters();
  playTone(220);

  const result = [];
  for (let index = 0; index < reelEls.length; index += 1) {
    const reel = reelEls[index];
    const ticker = setInterval(() => renderSymbol(reel, weightedSymbol()), 90);
    await sleep(650 + index * 260);
    clearInterval(ticker);

    const symbol = forcedResult?.[index] || weightedSymbol();
    result.push(symbol);
    renderSymbol(reel, symbol);
    reel.classList.remove("is-spinning");
    playTone(300 + index * 90);
  }

  const outcome = score(result);
  const win = bet * outcome.multiplier;

  if (win > 0) {
    balance += win;
    lastWinEl.textContent = money(win);
    banner.textContent = `${outcome.label}: ${money(win)}`;
    banner.classList.add("is-win");
    reelEls.forEach((reel) => reel.classList.add("is-winning"));
    playTone(660, 0.16);
    await sleep(110);
    playTone(880, 0.18);
  } else {
    banner.textContent = balance >= bet ? "Try again" : "Out of credits";
  }

  spinning = false;
  forcedResult = null;
  setBet(Math.min(bet, Math.max(Number(slider.min), balance)));
  updateMeters();
}

window.forceSpin = async function forceSpin(symbolIds) {
  const pickedSymbols = symbolIds.map(symbolById);

  if (pickedSymbols.length !== reelEls.length || pickedSymbols.some((symbol) => !symbol)) {
    console.info("Use three symbols: wild, seven, gem, bell, cherry");
    return;
  }

  forcedResult = pickedSymbols;
  await spin();
};