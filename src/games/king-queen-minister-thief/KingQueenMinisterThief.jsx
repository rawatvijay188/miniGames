import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import GameNav from "../../components/GameNav.jsx";
import RulesModal from "../../components/RulesModal.jsx";
import Meter from "../../components/Meter.jsx";
import { playTone } from "../../utils/audio.js";
import { money } from "../../utils/format.js";
import { sleep } from "../../utils/timing.js";

const INITIAL_BALANCE = 600;
const INITIAL_BET = 30;
const MIN_BET = 10;
const MAX_BET = 120;
const CARD_WIDTH = 120;
const CARD_HEIGHT = 120;
const CARD_SPACING = 144;
const REEL_COUNT = 3;
const ROW_COUNT = 3;

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

function createReel(symbols) {
  const reel = new PIXI.Container();
  const cards = symbols.map((symbol, rowIndex) => {
    const card = createSymbolCard(symbol);
    card.y = rowIndex * CARD_SPACING;
    reel.addChild(card);
    return card;
  });
  return { reel, cards };
}

function updateStagePosition(app) {
  const totalWidth = (REEL_COUNT - 1) * CARD_SPACING + CARD_WIDTH;
  const totalHeight = (ROW_COUNT - 1) * CARD_SPACING + CARD_HEIGHT;
  app.stage.x = Math.max(0, (app.renderer.width - totalWidth) / 2);
  app.stage.y = Math.max(0, (app.renderer.height - totalHeight) / 2);
}

function updateReelCards(index, symbols, reelRefs) {
  const reelRef = reelRefs.current[index];
  if (!reelRef) return;

  reelRef.cards.forEach((oldCard, rowIndex) => {
    reelRef.reel.removeChild(oldCard);
    const card = createSymbolCard(symbols[rowIndex]);
    card.y = rowIndex * CARD_SPACING;
    reelRef.reel.addChild(card);
    reelRef.cards[rowIndex] = card;
  });
  reelRef.symbols = symbols;
}

export default function KingQueenMinisterThief() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const reelRefs = useRef([]);
  const spinTimeouts = useRef([]);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [bet, setBet] = useState(INITIAL_BET);
  const [lastWin, setLastWin] = useState(0);
  const [banner, setBanner] = useState("Ready to spin");
  const [spinning, setSpinning] = useState(false);
  const [winning, setWinning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    let isMounted = true;
    let handleResize;
    let didInit = false;
    const app = new PIXI.Application();
    appRef.current = app;

    async function initApp() {
      await app.init({
        width: 840,
        height: 360,
        backgroundAlpha: 0,
        antialias: true
      });

      didInit = true;
      if (!isMounted || !canvasRef.current) {
        return;
      }

      canvasRef.current.appendChild(app.view);
      app.renderer.resize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      updateStagePosition(app);

      handleResize = () => {
        if (canvasRef.current) {
          app.renderer.resize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
          updateStagePosition(app);
        }
      };

      window.addEventListener("resize", handleResize);

      const symbolSpacing = 220;
      const baseX = 90;

      for (let index = 0; index < REEL_COUNT; index += 1) {
        const symbols = Array.from({ length: ROW_COUNT }, weightedSymbol);
        const { reel, cards } = createReel(symbols);
        reel.x = baseX + index * symbolSpacing;
        reel.y = 24;
        app.stage.addChild(reel);
        reelRefs.current[index] = { reel, cards, symbols };
      }
    }

    initApp();

    return () => {
      isMounted = false;
      if (handleResize) {
        window.removeEventListener("resize", handleResize);
      }
      spinTimeouts.current.forEach((id) => clearTimeout(id));
      reelRefs.current = [];
      if (app && didInit) {
        app.destroy(true, { children: true, texture: true, baseTexture: true });
      }
    };
  }, []);

  function clampBet(nextBet, currentBalance = balance) {
    const max = Math.min(MAX_BET, Math.max(MIN_BET, currentBalance));
    return Math.min(max, Math.max(MIN_BET, nextBet));
  }

  const updateBet = (nextBet, availableBalance = balance) => {
    setBet(clampBet(nextBet, availableBalance));
  };

  async function spinRound(forcedIds) {
    if (spinning || balance < bet) return;

    setSpinning(true);
    setWinning(false);
    setBanner("Spinning court cards...");
    setLastWin(0);
    setBalance((current) => current - bet);
    playTone(soundOn, 200, 0.08);

    const results = [];

      for (let index = 0; index < REEL_COUNT; index += 1) {
        const interval = setInterval(() => {
          const symbols = Array.from({ length: ROW_COUNT }, weightedSymbol);
          updateReelCards(index, symbols, reelRefs);
        }, 90);
        spinTimeouts.current.push(interval);

        await sleep(800 + index * 360);
        clearInterval(interval);

        const finalSymbols = forcedIds?.length === 9
          ? forcedIds.map((id) => SYMBOLS.find((symbol) => symbol.id === id) || weightedSymbol())
          : forcedIds?.length === REEL_COUNT
            ? Array.from({ length: ROW_COUNT }, () => SYMBOLS.find((symbol) => symbol.id === forcedIds[index]) || weightedSymbol())
            : Array.from({ length: ROW_COUNT }, weightedSymbol);

        updateReelCards(index, finalSymbols, reelRefs);
        results.push(finalSymbols);
    }

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
    updateBet(bet, nextBalance);
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
              onClick={() => setSoundOn(!soundOn)}
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
          <button className="stepper" type="button" onClick={() => updateBet(bet - 10)} disabled={spinning || bet <= MIN_BET}>
            -
          </button>
          <input
            type="range"
            min={MIN_BET}
            max={MAX_BET}
            step="10"
            value={bet}
            onChange={(event) => updateBet(Number(event.target.value))}
            aria-label="Bet amount"
          />
          <button className="stepper" type="button" onClick={() => updateBet(bet + 10)} disabled={spinning || bet >= MAX_BET || bet >= balance}>
            +
          </button>
          <button className="spin-button" type="button" onClick={() => spinRound()} disabled={spinning || balance < bet}>
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
