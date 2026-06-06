# Mini Games Arcade — Claude Guide

**App:** Mini Games Arcade | `com.rawatvijay.minigames`  
**Stack:** React 19 + Vite 7 + Capacitor 8 + PixiJS 8  
**Target:** Google Play Store + Apple App Store  
**Rule #1:** Virtual coins only — no real money, no payouts, ever.

---

## Step 1 — Plan Before Coding
- Ask Claude to design features, suggest games, or plan systems before writing any code
- Solo dev constraints apply — keep scope realistic
- Do NOT switch stacks. Project is React + Capacitor. Stay there.
- Prompt: _"Claude, plan a daily bonus system for this app"_

## Step 2 — Generate Code
- Language: JavaScript (JSX). No TypeScript.
- Styling: `src/react.css`. No Tailwind, no CSS-in-JS.
- State: React hooks only. No Redux, no Zustand.
- Each game lives in its own folder under `src/games/`
- Always use existing utils: `playTone`, `money`, `sleep`, `navigate`
- Always include `<GameNav />` at top of every game
- Coin balance comes from `useCoins()` — not local `useState(INITIAL_BALANCE)`
- Prompt: _"Claude, build CoinContext with localStorage and daily bonus"_

## Step 3 — Build UI
- Mobile-first. All layouts must work at 360px–430px width.
- Touch targets minimum 44×44px
- Match dark arcade aesthetic already in `react.css`
- No new npm packages for UI
- Prompt: _"Claude, add coin balance display to the GameHub header"_

## Step 4 — Test & Debug
- Test in browser first: `npm run dev`
- After any code change, run `npm run cap:sync` before device testing
- Write tests with Vitest (not Jest) for logic files like `deck.js`, `scoring.js`
- Prompt: _"Claude, debug why coin balance resets between games"_

## Step 5 — Deploy to Play Store
```bash
npm run build
npx cap sync android
npx cap open android   # then: Build → Generate Signed AAB
```
- Content rating: 17+ (simulated gambling)
- Required: privacy policy URL, 512×512 icon, 1024×500 feature graphic, screenshots

## Step 6 — Deploy to App Store
```bash
npm install @capacitor/ios  # not done yet
npx cap add ios
npx cap sync ios
npx cap open ios            # then archive + upload via Xcode
```
- Requires: Mac + Xcode + Apple Developer account ($99/yr)
- Content rating: 17+ (simulated gambling)
- Required: 1024×1024 icon (no alpha), iPhone + iPad screenshots
- Review note: _"Virtual coins only. No real money. No payouts."_

---

## What's Left to Ship
- [ ] `src/context/CoinContext.jsx` — global coin wallet + daily bonus
- [ ] Update all 17 games to use `useCoins()`
- [ ] Coin balance in GameHub header
- [ ] iOS Capacitor setup
- [ ] App icon + splash screen
- [ ] Privacy policy page
- [ ] Store listing copy + screenshots

## Key Commands
```bash
npm run dev          # dev server
npm run build        # build to dist/
npm run cap:sync     # build + sync Android
npm run cap:open     # open Android Studio
```
