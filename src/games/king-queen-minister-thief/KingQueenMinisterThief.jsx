import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import GameNav from "../../components/GameNav.jsx";
import RulesModal from "../../components/RulesModal.jsx";
import Meter from "../../components/Meter.jsx";
import { useBet, useSound, useCoins, cellDuration, CELL_SLOW_MS, CELL_FAST_MS, money, sleep, playTone } from "../../gdk";

const MIN_BET = 10;
const MAX_BET = 120;
const CARD_WIDTH = 120;
const CARD_HEIGHT = 120;
const CARD_GAP = 24;
const CARD_SPACING = CARD_WIDTH + CARD_GAP; // 144 — used for both rows and columns
const STAGE_PADDING = 24;
const REEL_COUNT = 3;
const ROW_COUNT = 3;
// One extra card below the visible window so a fresh symbol can scroll up into
// the bottom row instead of popping in.
const STRIP_CARDS = ROW_COUNT + 1;
// How many cells each reel scrolls before landing. More cells = longer spin;
// the later reels scroll further so they stop left-to-right.
const SPIN_BASE_CELLS = 14;
const SPIN_EXTRA_CELLS = 6;
// The visible window shows ROW_COUNT rows; the canvas is sized to fit the 3×3
// grid exactly so nothing gets clipped.
const VISIBLE_HEIGHT = ROW_COUNT * CARD_HEIGHT + (ROW_COUNT - 1) * CARD_GAP;
const STAGE_WIDTH = REEL_COUNT * CARD_WIDTH + (REEL_COUNT - 1) * CARD_GAP + STAGE_PADDING * 2;
const STAGE_HEIGHT = VISIBLE_HEIGHT + STAGE_PADDING * 2;

const SYMBOLS = [
  { id: "king", label: "King", emoji: "♚", color: 0xf7bd4a, payout: 10, payoutLabel: "10x" },
  { id: "queen", label: "Queen", emoji: "♕", color: 0xed5f81, payout: 8, payoutLabel: "8x" },
  { id: "minister", label: "Minister", emoji: "♖", color: 0x49d7df, payout: 6, payoutLabel: "6x" },
  { id: "thief", label: "Thief", emoji: "🕵️", color: 0x70d67a, payout: 5, payoutLabel: "5x" }
];

function weightedSymbol() {
  const pool = [];
  SYMBOLS.forEach((symbol) => {
    const weight = symbol.id === "king" ? 5 : symbol.id === "queen" ? 6 : symbol.id === "minister" ? 8 : 10;
    for (let index = 0; index < weight; index += 1) {
      pool.push(symbol);
    }
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

function scoreSymbols(reels) {
  const lines = [];

  for (let row = 0; row < ROW_COUNT; row += 1) {
    lines.push(reels.map((reel) => reel[row]));
  }

  for (let col = 0; col < REEL_COUNT; col += 1) {
    lines.push(reels[col]);
  }

  let bestOutcome = { multiplier: 0, label: "No Win" };

  for (const line of lines) {
    const counts = line.reduce((acc, symbol) => {
      acc[symbol.id] = (acc[symbol.id] || 0) + 1;
      return acc;
    }, {});

    const tripled = line.find((symbol) => counts[symbol.id] === 3);
    if (tripled && tripled.payout > bestOutcome.multiplier) {
      bestOutcome = { multiplier: tripled.payout, label: `Triple ${tripled.label}` };
    }
  }

  const centerRow = reels.map((reel) => reel[1]);
  const centerCounts = centerRow.reduce((acc, symbol) => {
    acc[symbol.id] = (acc[symbol.id] || 0) + 1;
    return acc;
  }, {});
  const pair = Object.entries(centerCounts).find(([, count]) => count === 2);
  if (pair && bestOutcome.multiplier < 2) {
    bestOutcome = { multiplier: 2, label: "Court Pair" };
  }

  return bestOutcome;
}

// Picks the final window symbols (top → bottom) for one reel. `forcedIds` lets
// the test panel pin an outcome: 9 ids set the whole 3×3 grid, REEL_COUNT ids
// fill each reel with a single symbol, anything else is random.
function resolveFinalSymbols(index, forcedIds) {
  const byId = (id) => SYMBOLS.find((symbol) => symbol.id === id) || weightedSymbol();

  if (forcedIds?.length === REEL_COUNT * ROW_COUNT) {
    return forcedIds.slice(index * ROW_COUNT, index * ROW_COUNT + ROW_COUNT).map(byId);
  }
  if (forcedIds?.length === REEL_COUNT) {
    const symbol = byId(forcedIds[index]);
    return Array.from({ length: ROW_COUNT }, () => symbol);
  }
  return Array.from({ length: ROW_COUNT }, weightedSymbol);
}

function createSymbolCard(symbol) {
  const card = new PIXI.Container();

  const background = new PIXI.Graphics();
  background.beginFill(symbol.color);
  background.drawRoundedRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 16);
  background.endFill();

  const icon = new PIXI.Text(symbol.emoji, {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 48,
    align: "center"
  });
  icon.anchor.set(0.5, 0);
  icon.x = CARD_WIDTH / 2;
  icon.y = 16;

  const title = new PIXI.Text(symbol.label, {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 14,
    fontWeight: "bold",
    fill: 0x111111,
    align: "center"
  });
  title.anchor.set(0.5, 0);
  title.x = CARD_WIDTH / 2;
  title.y = 72;

  const payout = new PIXI.Text(symbol.payoutLabel, {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 12,
    fill: 0x111111,
    align: "center"
  });
  payout.anchor.set(0.5, 0);
  payout.x = CARD_WIDTH / 2;
  payout.y = 96;

  card.addChild(background, icon, title, payout);
  return card;
}

// A reel is a vertical strip of STRIP_CARDS cards stacked one cell apart. The
// top ROW_COUNT cards are the visible window; the extra card sits just below it
// and scrolls up into view as the strip moves.
function createReel(symbols) {
  const strip = new PIXI.Container();
  const cards = symbols.map((symbol, slot) => {
    const card = createSymbolCard(symbol);
    card.y = slot * CARD_SPACING;
    strip.addChild(card);
    return card;
  });
  return { strip, cards };
}

// Re-render every card in a strip to match a new symbols array (length
// STRIP_CARDS), keeping each card pinned to its slot.
function renderReel(reelRef, symbols) {
  reelRef.cards.forEach((oldCard, slot) => {
    reelRef.strip.removeChild(oldCard);
    oldCard.destroy({ children: true });
    const card = createSymbolCard(symbols[slot]);
    card.y = slot * CARD_SPACING;
    reelRef.strip.addChild(card);
    reelRef.cards[slot] = card;
  });
  reelRef.symbols = symbols;
}

// Advance the strip by one cell: every symbol shifts up one slot and a new
// symbol enters at the bottom. Paired with resetting strip.y, this reads as an
// endless upward scroll.
function rotateReel(reelRef, incomingSymbol) {
  const next = [...reelRef.symbols.slice(1), incomingSymbol];
  renderReel(reelRef, next);
}

function scaleCanvasToContainer(app) {
  // Keep the fixed STAGE_WIDTH×STAGE_HEIGHT render resolution and let CSS scale
  // the canvas down to fit the container width, preserving aspect ratio so the
  // grid is never cropped or distorted.
  const view = app.view;
  view.style.display = "block";
  view.style.width = "100%";
  view.style.height = "auto";
  view.style.maxWidth = `${STAGE_WIDTH}px`;
  view.style.margin = "0 auto";
}

// Decides which symbol enters the bottom of the strip on a given cell step.
// The result symbols are fed in so that, after the final step, they come to
// rest in the visible window rows (top → bottom). A symbol fed at step `s`
// ends up at slot `s + STRIP_CARDS - totalCells` once scrolling stops; we solve
// that for slots 0..ROW_COUNT-1 to schedule the three result feeds.
function incomingSymbolFor(step, totalCells, finalSymbols) {
  const slotAtRest = step + STRIP_CARDS - totalCells;
  if (slotAtRest >= 0 && slotAtRest < ROW_COUNT) {
    return finalSymbols[slotAtRest];
  }
  return weightedSymbol();
}

// Scrolls a reel upward over `totalCells` cells, sliding one full cell at a
// time. Each slide's duration follows a slow → fast → slow sine curve so the
// reel eases in and out. The chosen result lands exactly in the window. Driven
// by the PIXI ticker so it stops cleanly when the app is destroyed.
function spinReel(app, reelRef, finalSymbols, totalCells) {
  return new Promise((resolve) => {
    let step = 0;
    let elapsed = 0;

    const tick = (ticker) => {
      if (reelRef.strip.destroyed) {
        app.ticker.remove(tick);
        resolve();
        return;
      }

      elapsed += ticker.deltaMS;
      const duration = cellDuration(step, totalCells);

      if (elapsed >= duration) {
        // Finished this cell: snap to the next slot and rotate the data up.
        elapsed -= duration;
        rotateReel(reelRef, incomingSymbolFor(step, totalCells, finalSymbols));
        reelRef.strip.y = 0;
        step += 1;

        if (step >= totalCells) {
          reelRef.strip.y = 0;
          app.ticker.remove(tick);
          resolve();
        }
        return;
      }

      // Mid-cell: slide the strip up proportionally toward the next slot.
      reelRef.strip.y = -CARD_SPACING * (elapsed / duration);
    };

    app.ticker.add(tick);
  });
}

export default function KingQueenMinisterThief() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const reelRefs = useRef([]);
  const { balance, setBalance } = useCoins();
  const { soundOn, toggle, sfx } = useSound();
  const { bet, setBet, increase, decrease, reclamp, atMin, atMax, canBet, min, max } = useBet({
    initial: 30, min: MIN_BET, max: MAX_BET, step: 10, onChange: () => sfx.bet(),
  });
  const [lastWin, setLastWin] = useState(0);
  const [banner, setBanner] = useState("Ready to spin");
  const [spinning, setSpinning] = useState(false);
  const [winning, setWinning] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    let isMounted = true;
    let didInit = false;
    const app = new PIXI.Application();
    appRef.current = app;

    async function initApp() {
      await app.init({
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        backgroundAlpha: 0,
        antialias: true
      });

      didInit = true;
      if (!isMounted || !canvasRef.current) {
        return;
      }

      canvasRef.current.appendChild(app.view);
      scaleCanvasToContainer(app);

      for (let index = 0; index < REEL_COUNT; index += 1) {
        const symbols = Array.from({ length: STRIP_CARDS }, weightedSymbol);
        const { strip, cards } = createReel(symbols);

        // A reel container holds the scrolling strip and a mask that clips it to
        // the visible 3-row window so the buffer card and off-window cards stay
        // hidden while the strip slides.
        const reelContainer = new PIXI.Container();
        reelContainer.x = STAGE_PADDING + index * CARD_SPACING;
        reelContainer.y = STAGE_PADDING;

        const mask = new PIXI.Graphics();
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, CARD_WIDTH, VISIBLE_HEIGHT);
        mask.endFill();

        reelContainer.addChild(strip, mask);
        strip.mask = mask;
        app.stage.addChild(reelContainer);

        reelRefs.current[index] = { strip, cards, symbols };
      }
    }

    initApp();

    return () => {
      isMounted = false;
      reelRefs.current = [];
      if (app && didInit) {
        app.destroy(true, { children: true, texture: true, baseTexture: true });
      }
    };
  }, []);

  async function spinRound(forcedIds) {
    if (spinning || balance < bet) return;
    if (!appRef.current || reelRefs.current.length < REEL_COUNT) return; // reels not ready yet

    setSpinning(true);
    setWinning(false);
    setBanner("Spinning court cards...");
    setLastWin(0);
    setBalance((current) => current - bet);
    playTone(soundOn, 200, 0.08);

    const app = appRef.current;
    const results = Array.from({ length: REEL_COUNT }, (_, index) => resolveFinalSymbols(index, forcedIds));

    // Start every reel together; the later reels scroll more cells so they come
    // to rest one after another, left to right.
    await Promise.all(
      reelRefs.current.map((reelRef, index) =>
        reelRef
          ? spinReel(app, reelRef, results[index], SPIN_BASE_CELLS + index * SPIN_EXTRA_CELLS)
          : Promise.resolve()
      )
    );

    const outcome = scoreSymbols(results);
    const win = bet * outcome.multiplier;
    const nextBalance = balance - bet + win;

    setBalance(nextBalance);
    setLastWin(win);
    setBanner(win > 0 ? `${outcome.label}: ${money(win)}` : nextBalance >= bet ? "Try another spin" : "Out of balance");
    setWinning(win > 0);

    if (win > 0) {
      playTone(soundOn, 520, 0.12);
      await sleep(120);
      playTone(soundOn, 760, 0.1);
    }

    setSpinning(false);
    reclamp(nextBalance);
  }

  return (
    <main className="shell">
      <section className="machine" aria-label="Royal Court slot game">
        <GameNav />

        <header className="topbar">
          <div>
            <p className="kicker">Royal slots</p>
            <h1>King, Queen, Minister, Thief</h1>
          </div>
          <div className="bj-header-actions">
            <button
              className={`icon-button ${soundOn ? "" : "is-muted"}`}
              type="button"
              onClick={toggle}
              aria-label="Toggle sound"
              title="Toggle sound"
            >
              ♪
            </button>
            <RulesModal title="King, Queen, Minister, Thief">
              <p><strong>Goal:</strong> Spin the royal court and line up matching characters to win.</p>
              <ul>
                <li>Set your bet and press <strong>Spin</strong> across the 3×3 grid.</li>
                <li><strong>Three matching characters in a line</strong> (row or column) pays out.</li>
                <li>The <strong>King</strong> pays the most (10×), then Queen, Minister, and Thief.</li>
                <li>A matching <strong>pair on the center row</strong> wins a smaller Court Pair bonus.</li>
                <li>Your payout is the multiplier times your bet.</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="meters" aria-label="Game totals">
          <Meter label="Balance" value={money(balance)} />
          <Meter label="Bet" value={money(bet)} />
          <Meter label="Last Win" value={money(lastWin)} />
        </section>

          <section className="reel-window" aria-live="polite">
          <div className="payline" aria-hidden="true"></div>
          <div ref={canvasRef} className="reel-canvas" />
          <div className={`win-banner ${winning ? "is-win" : ""}`} role="status">
            {banner}
          </div>
        </section>

        <section className="controls" aria-label="Slot controls">
          <button className="stepper" type="button" onClick={decrease} disabled={spinning || atMin}>
            -
          </button>
          <input
            type="range"
            min={min}
            max={max}
            step="10"
            value={bet}
            onChange={(event) => setBet(Number(event.target.value))}
            aria-label="Bet amount"
          />
          <button className="stepper" type="button" onClick={increase} disabled={spinning || atMax}>
            +
          </button>
          <button className="spin-button" type="button" onClick={() => spinRound()} disabled={spinning || !canBet}>
            Spin
          </button>
        </section>

        <section className="paytable" aria-label="Paytable">
          <div><span>3 Kings in a line</span><strong>10x</strong></div>
          <div><span>3 Queens in a line</span><strong>8x</strong></div>
          <div><span>3 Ministers in a line</span><strong>6x</strong></div>
          <div><span>3 Thieves in a line</span><strong>5x</strong></div>
          <div><span>Center pair</span><strong>2x</strong></div>
        </section>

        <section className="test-panel" aria-label="Test outcomes">
          <span>Test Spin</span>
          <button type="button" onClick={() => spinRound(["king", "king", "king"])} disabled={spinning || balance < bet}>Kings</button>
          <button type="button" onClick={() => spinRound(["queen", "queen", "queen"])} disabled={spinning || balance < bet}>Queens</button>
          <button type="button" onClick={() => spinRound(["minister", "minister", "minister"])} disabled={spinning || balance < bet}>Ministers</button>
          <button type="button" onClick={() => spinRound(["thief", "thief", "thief"])} disabled={spinning || balance < bet}>Thieves</button>
          <button type="button" onClick={() => spinRound(["king", "king", "queen"])} disabled={spinning || balance < bet}>Pair</button>
        </section>
      </section>
    </main>
  );
}
