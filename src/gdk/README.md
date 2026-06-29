# GDK — Game Development Kit

Shared, reusable building blocks for every game in the Mini Games Arcade. The
goal: a new game (or a change to an existing one) should describe **what makes
it different**, not re-implement the betting loop, the chrome, the sounds, and
the RNG that every game shares.

Import everything from the barrel:

```js
import { useGame, GameShell, ScoreStrip, BetControls, Paytable, money, sleep } from "../../gdk";
```

---

## Layers

### 1. Logic (pure, unit-tested)

| Module | Exports | Notes |
| --- | --- | --- |
| `logic/rng.js` | `mulberry32`, `randInt`, `pick`, `weightedPick`, `shuffle`, `chance` | Seedable PRNG. Every function takes an optional `rng` (defaults to `Math.random`) so tests can pin outcomes. |
| `logic/bet.js` | `clampBet`, `DEFAULT_BET` | Single source of truth for bet sizing. |
| `logic/payout.js` | `settle`, `settleResult` | Casino-style settlement: `multiplier` = total return per coin staked (0 lose, 1 push, 2 even-money, N → N×). |
| `logic/sfx.js` | `playClick/Bet/Start/Win/Jackpot/Lose/Tick` | Named sound presets so a "win" sounds the same everywhere. |

These have no React dependency and ship with `*.test.js` suites (`npm test`).

### 2. Hooks

| Hook | Purpose |
| --- | --- |
| `useSound()` | `{ soundOn, toggle, sfx }` — toggle + presets with `soundOn` pre-bound (`sfx.win()`). |
| `useBet(opts)` | Bet state clamped to the live wallet balance: `{ bet, setBet, increase, decrease, reclamp, atMin, atMax, canBet, min, max, step }`. |
| `useGame(opts)` | The composite most wagering games want: wallet + `useBet` + `useSound` + a `busy` round-lock + win/loss messaging. Exposes `run(fn)`, `stake()`, and `settleBet({ multiplier })`. |

### 3. UI primitives (match the existing `react.css` classes)

| Component | Renders |
| --- | --- |
| `GameShell` | `shell → mini-game → GameNav → header` chrome, with sound toggle + Rules modal slots. |
| `ScoreStrip` | the `.score-strip` stat row. |
| `BetControls` | the `.mini-controls` stepper / range / action button. |
| `Paytable` | the `.paytable` prize rows. |

> Slot-machine games use a different layout (`machine`/`topbar`/`meters`), so
> they reuse the **hooks** (`useBet`, `useSound`, `useReelSpin`) but keep their
> own markup.

### 4. Spin engine (`spin/`) + constants

| Export | Purpose |
| --- | --- |
| `useReelSpin(opts)` | The whole reel-scroll dance for DOM grid slots: build strips → animate → stop left-to-right → reveal. Returns `{ reelSpin, rolling, spinSteps, spin, rows, durationScale }`. |
| `SpinningReels`, `toVisualColumns` | The scrolling-reel renderer + the flat→columns reshaper. |
| `useSpinEasing()` | Injects the sine-eased CSS keyframes once. |
| `cellDuration`, `totalSpinTime`, `defaultSpinSteps`, `generateSpinKeyframes` | Pure easing math (unit-tested). |
| `buildReelStrips`, `stopReelsSequentially`, `animateReelStrip` | Lower-level building blocks. |
| `SPIN`, `DEAL`, `CELL_SLOW_MS`, `CELL_FAST_MS` (from `constants.js`) | Shared animation pacing — tune in one place. |

A grid slot spins like this:

```jsx
const reels = useReelSpin({
  cols: COLS, rows: ROWS, randomGrid,
  flatten: (g) => { const f = []; for (r) for (c) f.push(g[r][c]); return f; },
  onStop: (c) => playTone(soundOn, 300 + c * 60, 0.05),
});

// in the spin handler:
const working = randomGrid();
await reels.spin(working, () => setGrid(working)); // resolves after the reveal

// in JSX:
{reels.reelSpin
  ? <SpinningReels columns={reels.reelSpin.columns} strips={reels.reelSpin.strips}
                   rolling={reels.rolling} rows={ROWS} spinSteps={reels.spinSteps}
                   durationScale={reels.durationScale} />
  : grid.map(...)}
```

`flatten` lists result symbols in the exact order the game maps cells into its
grid, so stopped reels line up with the revealed result. See `fruit-frenzy`,
`gem-storm`, and `cosmic-cascade` for the three grid layouts.

---

## Building a standard wagering game

```jsx
import { useGame, GameShell, ScoreStrip, BetControls, Paytable, money, sleep } from "../../gdk";

export default function MyGame() {
  const game = useGame({ bet: { initial: 20 }, idleMessage: "Spin to play!" });

  const spin = () => game.run(async () => {
    game.stake();                 // take the bet
    await sleep(800);             // animate
    const multiplier = Math.random() < 0.4 ? 2 : 0;
    game.settleBet({ multiplier }); // pays out, sets message + sound, reclamps bet
  });

  return (
    <GameShell title="My Game" kicker="Demo" soundOn={game.soundOn} onToggleSound={game.toggle}
               rules={<p>Match to win.</p>}>
      <ScoreStrip items={[
        { label: "Balance", value: money(game.balance) },
        { label: "Bet", value: money(game.bet) },
        { label: "Last Win", value: money(game.lastWin) },
      ]} />
      <BetControls {...game} actionLabel="Spin" onAction={spin} />
      <Paytable rows={[{ label: "Match", value: "2x" }]} />
    </GameShell>
  );
}
```

### When `settleBet` doesn't fit

Games with partial-return tiers (e.g. Plinko's 0.5×) or that display *profit*
rather than the full return (e.g. Roulette) settle manually using the wallet
helpers `game.stake()`, `game.setBalance`, `game.setLastWin`, `game.setMessage`,
`game.sfx.*`, and `game.reclamp(finalBalance)`. See `plinko-drop` and `roulette`
for reference.

---

## Rule #1

Virtual coins only — no real money, no payouts, ever. The wallet (`useCoins`)
and these payouts all operate on simulated coins.
