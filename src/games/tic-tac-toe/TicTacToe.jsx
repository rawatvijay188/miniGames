import { useState } from "react";
import GameNav from "../../components/GameNav.jsx";
import RulesModal from "../../components/RulesModal.jsx";
import { playTone } from "../../utils/audio.js";

// Pass-and-play Tic-Tac-Toe for two people on one device.
// Player 1 is X (cyan), Player 2 is O (gold). Tap an empty cell on your turn.

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

const EMPTY_BOARD = Array(9).fill(null);

// Returns { winner: "X" | "O", line: number[] } or null.
function findWinner(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

export default function TicTacToe() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [current, setCurrent] = useState("X");
  const [result, setResult] = useState(null); // { winner, line } | "draw" | null
  const [wins, setWins] = useState({ X: 0, O: 0, draws: 0 });
  const [soundOn, setSoundOn] = useState(true);

  const winLine = result && result !== "draw" ? result.line : [];
  const gameOver = result !== null;

  const playClick = () => playTone(soundOn, current === "X" ? 360 : 300, 0.05);
  const playWin = () => {
    playTone(soundOn, 523, 0.12);
    setTimeout(() => playTone(soundOn, 784, 0.16), 120);
  };
  const playDraw = () => playTone(soundOn, 330, 0.12);

  const placeMark = (index) => {
    if (gameOver || board[index]) return;
    playClick();

    const next = board.slice();
    next[index] = current;
    setBoard(next);

    const won = findWinner(next);
    if (won) {
      setResult(won);
      setWins((w) => ({ ...w, [won.winner]: w[won.winner] + 1 }));
      playWin();
      return;
    }

    if (next.every((cell) => cell)) {
      setResult("draw");
      setWins((w) => ({ ...w, draws: w.draws + 1 }));
      playDraw();
      return;
    }

    setCurrent((c) => (c === "X" ? "O" : "X"));
  };

  const nextRound = () => {
    playTone(soundOn, 320, 0.05);
    setBoard(EMPTY_BOARD);
    setResult(null);
    // Loser (or Player 2 after a draw) starts the next round for fairness.
    setCurrent(result && result !== "draw" ? (result.winner === "X" ? "O" : "X") : "X");
  };

  const resetMatch = () => {
    playTone(soundOn, 320, 0.05);
    setWins({ X: 0, O: 0, draws: 0 });
    setBoard(EMPTY_BOARD);
    setResult(null);
    setCurrent("X");
  };

  const toggleSound = () => {
    playTone(true, 320, 0.05);
    setSoundOn((on) => !on);
  };

  const status = result === "draw"
    ? "It's a draw!"
    : result
      ? `Player ${result.winner === "X" ? "1" : "2"} (${result.winner}) wins!`
      : `Player ${current === "X" ? "1" : "2"}'s turn`;

  return (
    <main className="shell">
      <section className="mini-game" aria-label="Tic-Tac-Toe game">
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            <p className="kicker">Pass &amp; play · 2 players</p>
            <h1>Tic-Tac-Toe</h1>
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
            <RulesModal title="Tic-Tac-Toe">
              <p><strong>Goal:</strong> Two players share one device. Be the first to line up three of your marks.</p>
              <ul>
                <li><strong>Player 1</strong> is <strong>X</strong>, <strong>Player 2</strong> is <strong>O</strong>. X always goes first.</li>
                <li>On your turn, tap any empty square to place your mark, then pass the device.</li>
                <li>Get <strong>three in a row</strong> — across, down, or diagonally — to win the round.</li>
                <li>If all nine squares fill with no line, it's a <strong>draw</strong>.</li>
                <li>The previous loser starts the next round. No coins — just bragging rights!</li>
              </ul>
            </RulesModal>
          </div>
        </header>

        <section className="score-strip" aria-label="Match score">
          <div><span style={{ color: "#49d7df" }}>Player 1 (X)</span><strong>{wins.X}</strong></div>
          <div><span>Draws</span><strong>{wins.draws}</strong></div>
          <div><span style={{ color: "#f7bd4a" }}>Player 2 (O)</span><strong>{wins.O}</strong></div>
        </section>

        <p className={`ttt-status turn-${current.toLowerCase()}`} role="status">{status}</p>

        <section className="ttt-board" aria-label="Tic-Tac-Toe board">
          {board.map((cell, index) => (
            <button
              key={index}
              type="button"
              className={`ttt-cell mark-${cell ? cell.toLowerCase() : "empty"} ${winLine.includes(index) ? "is-win" : ""}`}
              onClick={() => placeMark(index)}
              disabled={gameOver || Boolean(cell)}
              aria-label={cell ? `Square ${index + 1}, ${cell}` : `Square ${index + 1}, empty`}
            >
              {cell}
            </button>
          ))}
        </section>

        <section className="bj-actions" aria-label="Round controls">
          <button className="spin-button" type="button" onClick={nextRound} disabled={!gameOver}>
            {gameOver ? "Next round" : "Round in play"}
          </button>
          <button className="stepper bj-double" type="button" onClick={resetMatch}>Reset match</button>
        </section>

        <section className="paytable" aria-label="Rules summary">
          <div><span>Players</span><strong>2 · pass &amp; play</strong></div>
          <div><span>Player 1</span><strong>X goes first</strong></div>
          <div><span>Win</span><strong>3 in a row</strong></div>
          <div><span>Full board</span><strong>Draw</strong></div>
        </section>
      </section>
    </main>
  );
}
