import GameNav from "../../components/GameNav.jsx";
import RulesModal from "../../components/RulesModal.jsx";

// The page chrome every game shares: the `shell → mini-game → GameNav → header`
// stack, the kicker/title, the optional sound toggle, and a Rules modal slot.
// Game-specific content is `children`.
//
//   <GameShell
//     label="Lucky Wheel game"
//     kicker="Wheel of fortune"
//     title="Lucky Wheel"
//     soundOn={soundOn}
//     onToggleSound={toggle}
//     rules={<><p>…</p></>}
//   >
//     …game body…
//   </GameShell>
export default function GameShell({
  label,
  kicker,
  title,
  soundOn,
  onToggleSound,
  rules,
  headerExtra,
  children,
}) {
  return (
    <main className="shell">
      <section className="mini-game" aria-label={label || `${title} game`}>
        <GameNav />
        <header className="mini-header bj-header">
          <div>
            {kicker && <p className="kicker">{kicker}</p>}
            <h1>{title}</h1>
          </div>
          <div className="bj-header-actions">
            {headerExtra}
            {onToggleSound && (
              <button
                className={`icon-button ${soundOn ? "" : "is-muted"}`}
                type="button"
                onClick={onToggleSound}
                aria-label="Toggle sound"
                aria-pressed={!soundOn}
                title="Toggle sound"
              >
                ♪
              </button>
            )}
            {rules && <RulesModal title={title}>{rules}</RulesModal>}
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
