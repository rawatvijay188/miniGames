import { useCallback, useMemo, useState } from "react";
import * as presets from "../logic/sfx.js";

// Per-game sound toggle plus a ready-to-call `sfx` object with `soundOn`
// already bound. Replaces the `const [soundOn, setSoundOn] = useState(true)`
// boilerplate that lived in every game.
//
//   const { soundOn, toggle, sfx } = useSound();
//   sfx.win();          // respects the toggle
//   <SoundToggle ... />  // see GameShell header
export function useSound(initial = true) {
  const [soundOn, setSoundOn] = useState(initial);

  const toggle = useCallback(() => {
    // Always click on the way to toggling so muting still gives feedback.
    presets.playClick(true);
    setSoundOn((on) => !on);
  }, []);

  const sfx = useMemo(
    () => ({
      click: () => presets.playClick(soundOn),
      bet: () => presets.playBet(soundOn),
      start: () => presets.playStart(soundOn),
      win: () => presets.playWin(soundOn),
      jackpot: () => presets.playJackpot(soundOn),
      lose: () => presets.playLose(soundOn),
      tick: (step) => presets.playTick(soundOn, step),
    }),
    [soundOn]
  );

  return { soundOn, setSoundOn, toggle, sfx };
}
