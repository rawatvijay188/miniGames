import { useEffect, useRef, useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import RulesModal from "../../components/RulesModal.jsx";
import { playTone } from "../../utils/audio.js";

// Pass-and-play Neon Snake Duel for two people on one device.
// Each player drives a constantly-moving snake that leaves a solid neon trail.
// Crash into a wall, your own trail, or your rival's trail and you're out.
// Player 1 = red, Player 2 = blue. Two turn buttons each (turn left / right).

const COLS = 21;
const ROWS = 21;
const CELL = 16; // canvas pixels per grid cell
const TICK_MS = 130; // movement speed (lower = faster)

// Directions in clockwise order so a right turn is +1 and a left turn is -1 (mod 4).
const DIRS = [
  { x: 0, y: -1 }, // 0 up
  { x: 1, y: 0 },  // 1 right
  { x: 0, y: 1 },  // 2 down
  { x: -1, y: 0 }  // 3 left
];

const RED = { trail: "#f35f76", head: "#ffd0d8", glow: "rgba(243, 95, 118, 0.6)" };
const BLUE = { trail: "#4a90f7", head: "#cfe0ff", glow: "rgba(74, 144, 247, 0.6)" };

const key = (x, y) => `${x},${y}`;

function createGame() {
  const redStart = { x: Math.floor(COLS / 3), y: ROWS - 5 };
  const blueStart = { x: Math.floor((COLS * 2) / 3), y: 4 };
  return {
    red: { head: { ...redStart }, cells: [{ ...redStart }], dir: 0, pending: null, alive: true },   // moving up
    blue: { head: { ...blueStart }, cells: [{ ...blueStart }], dir: 2, pending: null, alive: true }, // moving down
    occupied: new Set([key(redStart.x, redStart.y), key(blueStart.x, blueStart.y)])
  };
}

export default function NeonSnakeDuel() {
  const canvasRef = useRef(null);
  const gameRef = useRef(createGame());
  const soundOnRef = useRef(true);
  const startRef = useRef(() => {});

  const [phase, setPhase] = useState("ready"); // "ready" | "playing" | "over"
  const [message, setMessage] = useState("Tap Start — Red vs Blue!");
  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [soundOn, setSoundOn] = useState(true);

  const playClick = () => playTone(soundOnRef.current, 320, 0.05);
  const playCrash = () => playTone(soundOnRef.current, 150, 0.28);
  const playWin = () => {
    playTone(soundOnRef.current, 523, 0.12);
    setTimeout(() => playTone(soundOnRef.current, 784, 0.16), 120);
  };

  // Advance both snakes one cell. Mutates gameRef; returns the round result.
  const step = () => {
    const g = gameRef.current;
    for (const p of [g.red, g.blue]) {
      if (p.alive && p.pending) {
        p.dir = (p.dir + (p.pending === "R" ? 1 : 3)) % 4;
      }
      p.pending = null;
    }

    const nextOf = (p) => ({ x: p.head.x + DIRS[p.dir].x, y: p.head.y + DIRS[p.dir].y });
    const rN = g.red.alive ? nextOf(g.red) : null;
    const bN = g.blue.alive ? nextOf(g.blue) : null;

    const bad = (c) =>
      !c || c.x < 0 || c.y < 0 || c.x >= COLS || c.y >= ROWS || g.occupied.has(key(c.x, c.y));

    let rCrash = g.red.alive && bad(rN);
    let bCrash = g.blue.alive && bad(bN);
    if (rN && bN && rN.x === bN.x && rN.y === bN.y) {
      rCrash = true;
      bCrash = true;
    }

    if (g.red.alive && !rCrash) {
      g.red.head = rN;
      g.red.cells.push(rN);
      g.occupied.add(key(rN.x, rN.y));
    }
    if (g.blue.alive && !bCrash) {
      g.blue.head = bN;
      g.blue.cells.push(bN);
      g.occupied.add(key(bN.x, bN.y));
    }
    if (rCrash) g.red.alive = false;
    if (bCrash) g.blue.alive = false;

    if (g.red.alive && g.blue.alive) return { ended: false, winner: null };
    if (!g.red.alive && !g.blue.alive) return { ended: true, winner: "draw" };
    return { ended: true, winner: g.red.alive ? "red" : "blue" };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const g = gameRef.current;

    ctx.fillStyle = "#0b0d12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // faint grid
    ctx.strokeStyle = "rgba(54, 64, 82, 0.35)";
    ctx.lineWidth = 1;
    for (let i = 1; i < COLS; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * CELL + 0.5, 0);
      ctx.lineTo(i * CELL + 0.5, ROWS * CELL);
      ctx.stroke();
    }
    for (let j = 1; j < ROWS; j += 1) {
      ctx.beginPath();
      ctx.moveTo(0, j * CELL + 0.5);
      ctx.lineTo(COLS * CELL, j * CELL + 0.5);
      ctx.stroke();
    }

    const paint = (player, palette) => {
      ctx.fillStyle = palette.trail;
      for (const c of player.cells) {
        ctx.fillRect(c.x * CELL + 1, c.y * CELL + 1, CELL - 2, CELL - 2);
      }
      // brighter glowing head
      ctx.save();
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 12;
      ctx.fillStyle = palette.head;
      ctx.fillRect(player.head.x * CELL + 1, player.head.y * CELL + 1, CELL - 2, CELL - 2);
      ctx.restore();
    };

    paint(g.red, RED);
    paint(g.blue, BLUE);
  };

  // Draw the current board whenever phase changes, and run the tick loop while playing.
  useEffect(() => {
    draw();
    if (phase !== "playing") return undefined;

    const id = setInterval(() => {
      const result = step();
      draw();
      if (result.ended) {
        clearInterval(id);
        if (result.winner === "draw") {
          setMessage("Draw — you both crashed!");
          playCrash();
        } else {
          const name = result.winner === "red" ? "Player 1 (Red)" : "Player 2 (Blue)";
          setMessage(`${name} wins the round!`);
          setScores((s) => ({ ...s, [result.winner]: s[result.winner] + 1 }));
          playCrash();
          playWin();
        }
        setPhase("over");
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = () => {
    gameRef.current = createGame();
    setMessage("Go! Steer with your turn buttons.");
    setPhase("playing");
  };
  startRef.current = startRound;

  const nextRound = () => {
    playClick();
    startRound();
  };

  const resetMatch = () => {
    playClick();
    setScores({ red: 0, blue: 0 });
    gameRef.current = createGame();
    setMessage("Tap Start — Red vs Blue!");
    setPhase("ready");
  };

  const turn = (who, dir) => {
    const g = gameRef.current;
    const player = who === "red" ? g.red : g.blue;
    if (player.alive) player.pending = dir;
  };

  // Keyboard: Player 1 red = A/D, Player 2 blue = ← / →, Space = start/next.
  useEffect(() => {
    const onKey = (e) => {
      switch (e.code) {
        case "KeyA": turn("red", "L"); break;
        case "KeyD": turn("red", "R"); break;
        case "ArrowLeft": turn("blue", "L"); e.preventDefault(); break;
        case "ArrowRight": turn("blue", "R"); e.preventDefault(); break;
        case "Space":
          e.preventDefault();
          startRef.current();
          break;
        default: break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleSound = () => {
    playTone(true, 320, 0.05);
    setSoundOn((on) => {
      soundOnRef.current = !on;
      return !on;
    });
  };

  const playing = phase === "playing";

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Neon Snake Duel game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">Pass &amp; play · 2 players</p>
            <h1>Neon Snake Duel</h1>
          </div>
          <div className="bj-header-actions">
            <button
              className={`icon-button ${soundOn ? "" : "is-muted"}`}
              type="button"
              onClick={toggleSound}
              aria-label={soundOn ? "Mute sound" : "Unmute sound"}
              title={soundOn ? "Mute sound" : "Unmute sound"}
            >
              {soundOn ? "♪" : "♪̸"}
            </button>
            <RulesModal title="Neon Snake Duel">
              <p><strong>Goal:</strong> Two players, one device. Your snake never stops moving and leaves a solid neon trail. Outlast your rival.</p>
              <ul>
                <li><strong>Player 1</strong> drives the <strong>red</strong> snake, <strong>Player 2</strong> the <strong>blue</strong> snake.</li>
                <li>Use your two buttons to <strong>turn left</strong> or <strong>turn right</strong> — you can't stop or reverse.</li>
                <li>Crash into a <strong>wall</strong>, your <strong>own trail</strong>, or your <strong>rival's trail</strong> and you're out.</li>
                <li>The last snake still moving <strong>wins the round</strong>. Both crash at once? It's a draw.</li>
                <li>On a keyboard: Red turns with <strong>A / D</strong>, Blue with <strong>← / →</strong>. No coins — just bragging rights!</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="score-strip" aria-label="Match score">
          <div><span style={{ color: RED.trail }}>Player 1 · Red</span><strong>{scores.red}</strong></div>
          <div><span>Round</span><strong>{phase === "over" ? "Over" : phase === "ready" ? "Ready" : "Racing"}</strong></div>
          <div><span style={{ color: BLUE.trail }}>Player 2 · Blue</span><strong>{scores.blue}</strong></div>
        </section>

        {/* Player 2 (blue) sits across the table — controls on top. */}
        <div className="lc-controls lc-controls-blue" aria-label="Player 2 controls">
          <button className="lc-btn" type="button" onPointerDown={() => turn("blue", "L")} disabled={!playing} aria-label="Blue turn left">↰</button>
          <span className="lc-tag" style={{ color: BLUE.trail }}>Blue</span>
          <button className="lc-btn" type="button" onPointerDown={() => turn("blue", "R")} disabled={!playing} aria-label="Blue turn right">↱</button>
        </div>

        <div className="lc-stage">
          <canvas
            ref={canvasRef}
            className="lc-canvas"
            width={COLS * CELL}
            height={ROWS * CELL}
            aria-label="Duel arena"
          />
          <p className="lc-message" role="status">{message}</p>
        </div>

        {/* Player 1 (red) — controls on the bottom. */}
        <div className="lc-controls lc-controls-red" aria-label="Player 1 controls">
          <button className="lc-btn" type="button" onPointerDown={() => turn("red", "L")} disabled={!playing} aria-label="Red turn left">↰</button>
          <span className="lc-tag" style={{ color: RED.trail }}>Red</span>
          <button className="lc-btn" type="button" onPointerDown={() => turn("red", "R")} disabled={!playing} aria-label="Red turn right">↱</button>
        </div>

        <section className="bj-actions" aria-label="Round controls">
          {phase === "ready" && (
            <button className="spin-button" type="button" onClick={startRound}>Start</button>
          )}
          {phase === "playing" && (
            <button className="spin-button" type="button" disabled>Racing…</button>
          )}
          {phase === "over" && (
            <button className="spin-button" type="button" onClick={nextRound}>Next round</button>
          )}
          <button className="stepper bj-double" type="button" onClick={resetMatch}>Reset match</button>
        </section>

        <section className="paytable" aria-label="Rules summary">
          <div><span>Players</span><strong>2 · pass &amp; play</strong></div>
          <div><span>Controls</span><strong>Turn L / R</strong></div>
          <div><span>Crash</span><strong>Wall or trail</strong></div>
          <div><span>Win</span><strong>Last one moving</strong></div>
        </section>
      </section>
    </main>
  );
}
