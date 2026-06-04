import { useState } from "react";
import { playTone } from "../utils/audio.js";

// Reusable Rules button + modal. Drop into any game's header:
//   <RulesModal title="Game Name"> ...rules content... </RulesModal>
// Manages its own open/close state and reuses the shared .rules-* styles.
export default function RulesModal({ title, children }) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <button
        className="rules-button"
        type="button"
        onClick={() => { playTone(true, 320, 0.05); setOpen(true); }}
      >
        Rules
      </button>

      {open && (
        <div
          className="rules-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} rules`}
          onClick={close}
        >
          <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
            <header className="rules-modal-head">
              <h2>How to play {title}</h2>
              <button className="icon-button" type="button" onClick={close} aria-label="Close rules">×</button>
            </header>
            <div className="rules-body">{children}</div>
            <button className="spin-button" type="button" onClick={close}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
