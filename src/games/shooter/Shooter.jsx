import { useEffect, useRef, useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import RulesModal from "../../components/RulesModal.jsx";

const CANVAS_WIDTH = 920;
const CANVAS_HEIGHT = 520;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 16;
const PLAYER_Y = CANVAS_HEIGHT - 64;
const PLAYER_SPEED = 6;
const BULLET_SPEED = 10;
const ENEMY_SIZE = 26;
const ENEMY_BASE_SPEED = 2.2;
const SPAWN_FRAMES = 55;
const STORAGE_KEY = "duo-space-shooter-records";
const NAME_STORAGE_KEY = "duo-space-shooter-player-names";
const DEFAULT_PLAYER_NAMES = ["Pilot 1", "Pilot 2"];

function createInitialGame() {
  return {
    status: "ready",
    lives: [3, 3],
    scores: [0, 0],
    frame: 0,
    lastSpawn: 0,
    lastShot: [0, 0],
    players: [
      {
        x: 140,
        y: PLAYER_Y,
        color: "#49d7df",
        bullets: []
      },
      {
        x: CANVAS_WIDTH - 140,
        y: PLAYER_Y,
        color: "#f7bd4a",
        bullets: []
      }
    ],
    enemies: []
  };
}

function readSavedRecords() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function readSavedNames() {
  if (typeof window === "undefined") {
    return DEFAULT_PLAYER_NAMES;
  }

  try {
    const stored = window.localStorage.getItem(NAME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PLAYER_NAMES;
  } catch {
    return DEFAULT_PLAYER_NAMES;
  }
}

function savePlayerNames(names) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NAME_STORAGE_KEY, JSON.stringify(names));
}

function saveRecords(records) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function collideRect(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export default function Shooter() {
  const canvasRef = useRef(null);
  const gameRef = useRef(createInitialGame());
  const keysRef = useRef({});
  const savedGameOverRef = useRef(false);
  const [playerNames, setPlayerNames] = useState(() => readSavedNames());
  const [playerScores, setPlayerScores] = useState([0, 0]);
  const [player1Lives, setPlayer1Lives] = useState(3);
  const [player2Lives, setPlayer2Lives] = useState(3);
  const [status, setStatus] = useState("ready");
  const [savedScores, setSavedScores] = useState(() => readSavedRecords());
  const totalScore = playerScores[0] + playerScores[1];

  function normalizeName(name, index) {
    const trimmed = name.trim();
    return trimmed || `Pilot ${index + 1}`;
  }

  function updatePlayerName(index, value) {
    const nextNames = [...playerNames];
    nextNames[index] = value;
    setPlayerNames(nextNames);
    savePlayerNames(nextNames);
  }

  function resetGame() {
    gameRef.current = createInitialGame();
    setPlayerScores([0, 0]);
    setPlayer1Lives(3);
    setPlayer2Lives(3);
    setStatus("ready");
    savedGameOverRef.current = false;
  }

  function startGame() {
    gameRef.current = createInitialGame();
    gameRef.current.status = "playing";
    setPlayerScores([0, 0]);
    setPlayer1Lives(3);
    setPlayer2Lives(3);
    setStatus("playing");
    savedGameOverRef.current = false;
  }

  // Auto-start when the component mounts so selecting the tile begins play immediately
  useEffect(() => {
    startGame();
    // do not restart automatically on remounts beyond initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function savePlayerHighScores() {
    const names = playerNames.map(normalizeName);
    const currentScores = gameRef.current.scores || [0, 0];
    const updatedRecords = { ...readSavedRecords() };

    currentScores.forEach((value, index) => {
      const name = names[index];
      const previous = updatedRecords[name] || 0;
      if (value > previous) {
        updatedRecords[name] = value;
      }
    });

    setSavedScores(updatedRecords);
    saveRecords(updatedRecords);
  }

  function damagePlayer(playerIndex) {
    const game = gameRef.current;
    if (game.lives[playerIndex] <= 0) {
      return;
    }
    game.lives[playerIndex] -= 1;
    if (playerIndex === 0) {
      setPlayer1Lives(game.lives[0]);
    } else {
      setPlayer2Lives(game.lives[1]);
    }
    if (game.lives[0] <= 0 && game.lives[1] <= 0) {
      game.status = "game-over";
      setStatus("game-over");
    }
  }

  useEffect(() => {
    if (status !== "game-over") {
      savedGameOverRef.current = false;
      return;
    }

    if (savedGameOverRef.current) {
      return;
    }

    savePlayerHighScores();
    savedGameOverRef.current = true;
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    function spawnEnemy() {
      const x = Math.random() * (CANVAS_WIDTH - ENEMY_SIZE * 2) + ENEMY_SIZE;
      gameRef.current.enemies.push({
        x,
        y: -ENEMY_SIZE,
        size: ENEMY_SIZE,
        speed: ENEMY_BASE_SPEED + Math.random() * 1.4,
        color: "#f35f76"
      });
    }

    function fireBullet(playerIndex) {
      const game = gameRef.current;
      const player = game.players[playerIndex];
      const now = game.frame;
      if (now - game.lastShot[playerIndex] < 18) {
        return;
      }
      game.lastShot[playerIndex] = now;
      player.bullets.push({
        x: player.x + PLAYER_WIDTH / 2 - 4,
        y: player.y - 10,
        width: 8,
        height: 16,
        color: player.color
      });
    }

    function update() {
      const game = gameRef.current;
      if (game.status !== "playing") {
        return;
      }

      const keys = keysRef.current;
      const player1 = game.players[0];
      const player2 = game.players[1];

      if (keys.KeyA) {
        player1.x -= PLAYER_SPEED;
      }
      if (keys.KeyD) {
        player1.x += PLAYER_SPEED;
      }
      if (keys.KeyW) {
        fireBullet(0);
      }
      if (keys.ArrowLeft) {
        player2.x -= PLAYER_SPEED;
      }
      if (keys.ArrowRight) {
        player2.x += PLAYER_SPEED;
      }
      if (keys.ArrowUp) {
        fireBullet(1);
      }

      player1.x = clamp(player1.x, 10, CANVAS_WIDTH - PLAYER_WIDTH - 10);
      player2.x = clamp(player2.x, 10, CANVAS_WIDTH - PLAYER_WIDTH - 10);

      game.players.forEach((player) => {
        player.bullets = player.bullets.filter((bullet) => bullet.y + bullet.height > 0);
        player.bullets.forEach((bullet) => {
          bullet.y -= BULLET_SPEED;
        });
      });

      game.enemies.forEach((enemy) => {
        enemy.y += enemy.speed;
      });

      if (game.frame - game.lastSpawn >= SPAWN_FRAMES) {
        spawnEnemy();
        game.lastSpawn = game.frame;
      }

      const remainingEnemies = [];

      for (const enemy of game.enemies) {
        let hitByBullet = false;

        game.players.forEach((player, playerIndex) => {
          player.bullets = player.bullets.filter((bullet) => {
            if (collideRect(bullet.x, bullet.y, bullet.width, bullet.height, enemy.x, enemy.y, enemy.size, enemy.size)) {
              hitByBullet = true;
              game.scores[playerIndex] += 12;
              setPlayerScores([...game.scores]);
              return false;
            }
            return true;
          });
        });

        if (hitByBullet) {
          continue;
        }

        let destroyed = false;
        if (collideRect(enemy.x, enemy.y, enemy.size, enemy.size, player1.x, player1.y, PLAYER_WIDTH, PLAYER_HEIGHT)) {
          damagePlayer(0);
          destroyed = true;
        }
        if (collideRect(enemy.x, enemy.y, enemy.size, enemy.size, player2.x, player2.y, PLAYER_WIDTH, PLAYER_HEIGHT)) {
          damagePlayer(1);
          destroyed = true;
        }

        if (!destroyed && enemy.y < CANVAS_HEIGHT + ENEMY_SIZE) {
          remainingEnemies.push(enemy);
        }
      }

      game.enemies = remainingEnemies;
      game.frame += 1;
    }

    function draw() {
      const game = gameRef.current;
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      context.fillStyle = "#091015";
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      context.fillStyle = "rgba(255,255,255,0.04)";
      for (let gridY = 0; gridY < 8; gridY += 1) {
        context.fillRect(0, gridY * 64, CANVAS_WIDTH, 1);
      }

      context.fillStyle = "rgba(255,255,255,0.1)";
      context.fillRect(CANVAS_WIDTH / 2 - 1, 0, 2, CANVAS_HEIGHT);

      game.enemies.forEach((enemy) => {
        context.fillStyle = enemy.color;
        context.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
      });

      game.players.forEach((player) => {
        context.fillStyle = player.color;
        context.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
        context.strokeStyle = "rgba(255,255,255,0.22)";
        context.strokeRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
        player.bullets.forEach((bullet) => {
          context.fillStyle = bullet.color;
          context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
      });

      context.fillStyle = "rgba(255,255,255,0.9)";
      context.font = "700 18px Inter, sans-serif";
      context.fillText("Player 1: A/D = move, W = shoot", 16, 28);
      context.fillText("Player 2: ←/→ = move, ↑ = shoot", 16, 52);
      context.fillText(`Status: ${status === "playing" ? "Fight!" : status === "game-over" ? "Game Over" : "Ready to play"}`, 16, 78);
    }

    let animationId = 0;

    function tick() {
      update();
      draw();
      animationId = requestAnimationFrame(tick);
    }

    animationId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [status]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.repeat) return;
      const code = event.code;
      if (code === "KeyA" || code === "KeyD" || code === "KeyW" || code === "ArrowLeft" || code === "ArrowRight" || code === "ArrowUp") {
        event.preventDefault();
        keysRef.current[code] = true;
      }
    }

    function handleKeyUp(event) {
      const code = event.code;
      if (keysRef.current[code]) {
        keysRef.current[code] = false;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <main className="shell shooter-shell">
      <section className="machine shooter-machine" aria-label="Space Shooter arcade game">
        <GameNav />
        <div className="shooter-header">
          <div>
            <p className="kicker">Local multiplayer</p>
            <h1>Duo Space Shooter</h1>
            <p>Two pilots share the screen. Defend the zone, dodge falling enemies, and score points together.</p>
          </div>
          <div className="bj-header-actions">
            <RulesModal title="Duo Space Shooter">
              <p><strong>Goal:</strong> Two players defend the zone together — survive the enemy waves and rack up points.</p>
              <ul>
                <li>Enter each pilot's name, then press <strong>Start</strong>.</li>
                <li><strong>Player 1:</strong> move with <strong>A / D</strong> and fire with <strong>W</strong>.</li>
                <li><strong>Player 2:</strong> move with the <strong>← / →</strong> arrow keys and fire with <strong>↑</strong>.</li>
                <li>Shoot down falling enemies for points; don't let them reach you.</li>
                <li>Your best scores are saved per player name — try to beat them.</li>
              </ul>
            </RulesModal>
            <button className="spin-button" type="button" onClick={startGame}>
              {status === "playing" ? "Restart" : "Start"}
            </button>
          </div>
        </div>

        <div className="player-config">
          <div className="player-input">
            <label>
              <span>Player 1 name</span>
              <input
                type="text"
                value={playerNames[0]}
                onChange={(event) => updatePlayerName(0, event.target.value)}
              />
            </label>
            <p>Best: {savedScores[normalizeName(playerNames[0], 0)] || 0}</p>
          </div>
          <div className="player-input">
            <label>
              <span>Player 2 name</span>
              <input
                type="text"
                value={playerNames[1]}
                onChange={(event) => updatePlayerName(1, event.target.value)}
              />
            </label>
            <p>Best: {savedScores[normalizeName(playerNames[1], 1)] || 0}</p>
          </div>
        </div>

        <div className="score-panel score-panel-wide">
          <div className="score-card">
            <span>{normalizeName(playerNames[0], 0)} Score</span>
            <strong>{playerScores[0]}</strong>
            <small>Lives {player1Lives}</small>
          </div>
          <div className="score-card">
            <span>{normalizeName(playerNames[1], 1)} Score</span>
            <strong>{playerScores[1]}</strong>
            <small>Lives {player2Lives}</small>
          </div>
          <div className="score-card">
            <span>Total Score</span>
            <strong>{totalScore}</strong>
            <small>Combined player points</small>
          </div>
        </div>

        <div className="shooter-board">
          <canvas className="shooter-canvas" ref={canvasRef} aria-label="Space shooter game canvas" />
          <div className="shooter-instructions">
            <p>Use the keys above to fly, shoot, and cooperate. Each player has limited shields; keep the bots off your side.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
