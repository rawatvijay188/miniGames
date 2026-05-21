import { useEffect, useRef, useState } from "react";
import GameNav from "../../components/GameNav.jsx";

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

function createInitialGame() {
  return {
    status: "ready",
    score: 0,
    lives: [3, 3],
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
  const [score, setScore] = useState(0);
  const [player1Lives, setPlayer1Lives] = useState(3);
  const [player2Lives, setPlayer2Lives] = useState(3);
  const [status, setStatus] = useState("ready");

  function resetGame() {
    gameRef.current = createInitialGame();
    setScore(0);
    setPlayer1Lives(3);
    setPlayer2Lives(3);
    setStatus("ready");
  }

  function startGame() {
    gameRef.current = createInitialGame();
    gameRef.current.status = "playing";
    setScore(0);
    setPlayer1Lives(3);
    setPlayer2Lives(3);
    setStatus("playing");
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
              game.score += 12;
              setScore(game.score);
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
          <button className="spin-button" type="button" onClick={startGame}>
            {status === "playing" ? "Restart" : "Start"}
          </button>
        </div>

        <div className="score-panel">
          <div className="score-card">
            <span>Score</span>
            <strong>{score}</strong>
          </div>
          <div className="score-card">
            <span>Player 1 Lives</span>
            <strong>{player1Lives}</strong>
          </div>
          <div className="score-card">
            <span>Player 2 Lives</span>
            <strong>{player2Lives}</strong>
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
