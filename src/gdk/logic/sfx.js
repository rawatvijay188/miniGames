// Named sound presets built on the low-level playTone synth. Games used to
// hand-pick raw frequencies inline ("playTone(soundOn, 760, 0.16)") which made
// the audio inconsistent game-to-game. These presets give the whole arcade one
// sonic identity: a "win" sounds like a win everywhere.
//
// Use directly with a boolean, or via the useSound() hook which binds `soundOn`
// for you (sfx.win() instead of playWin(soundOn)).

import { playTone } from "../../utils/audio.js";
import { sleep } from "../../utils/timing.js";

export function playClick(soundOn) {
  playTone(soundOn, 320, 0.05);
}

export function playBet(soundOn) {
  playTone(soundOn, 420, 0.05);
}

export function playStart(soundOn) {
  playTone(soundOn, 240, 0.08);
}

export function playWin(soundOn) {
  playTone(soundOn, 760, 0.16);
}

export async function playJackpot(soundOn) {
  playTone(soundOn, 660, 0.14);
  await sleep(120);
  playTone(soundOn, 880, 0.18);
  await sleep(120);
  playTone(soundOn, 1040, 0.22);
}

export function playLose(soundOn) {
  playTone(soundOn, 150, 0.24);
}

export function playTick(soundOn, step = 0) {
  playTone(soundOn, 400 + (step % 3) * 60, 0.03);
}
