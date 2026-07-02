# Mini Games Arcade — Deployment Checklist

**App:** Mini Games Arcade · `com.rawatvijay.minigames`
**Stack:** React 19 · Vite 7 · Capacitor 8 · PixiJS 8
**Target:** Google Play Store (Android first) → Apple App Store (later)
**Golden rule:** Virtual coins only. No real money. No payouts. Ever.

**Legend:** ☐ Not started · ◐ In progress · ☑ Done
**Owner:** 👤 You (manual/design/account) · 🤖 Claude (code) · 🤝 Both

---

## 1. Release Blockers — Play Store rejects without these

| # | Task | Owner | Priority | Status |
|---|------|-------|----------|--------|
| 1.1 | Write & host a **Privacy Policy** (public URL required by Play Console) | 🤝 | P0 | ◐ |
| 1.2 | Design & install **app icon** (512×512, replace default Capacitor icons) | 🤝 | P0 | ◐ |
| 1.3 | Create **feature graphic** (1024×500) | 🤝 | P0 | ◐ |
| 1.4 | Capture **phone screenshots** (4–8, min 320px) | 👤 | P0 | ☐ |
| 1.5 | Complete **content rating** questionnaire → 17+ (simulated gambling) | 👤 | P0 | ☐ |
| 1.6 | Generate **signed release AAB** + back up keystore securely | 👤 | P0 | ☐ |

## 2. Quality Gate — correctness before shipping

| # | Task | Owner | Priority | Status |
|---|------|-------|----------|--------|
| 2.1 | Add **Vitest** + tests for coin logic (payouts, daily bonus, refill) | 🤖 | P1 | ☑ |
| 2.2 | **Play-test all 19 games** end-to-end; verify payouts & no soft-locks | 👤 | P1 | ☐ |
| 2.3 | Audit for **any real-money path** (links, IAP, payments) — must be none | 🤖 | P1 | ☑ |
| 2.4 | Verify layouts at **360–430px** width; touch targets ≥ 44×44px | 👤 | P1 | ☐ |

## 3. Polish & Branding — fix before public listing

| # | Task | Owner | Priority | Status |
|---|------|-------|----------|--------|
| 3.1 | ~~Fix stale "17 games inside" copy~~ — verified correct (17 slot games + 2 pass-and-play = 19 total) | 🤖 | P2 | ☑ |
| 3.2 | Rename package **`slot-game-hub` → mini-games-arcade**; align app label | 🤖 | P2 | ☑ |
| 3.3 | Replace **splash screen** (remove default Capacitor splash) | 🤖 | P2 | ☑ |
| 3.4 | Write **store listing copy** (title, short + full description) — see `STORE_LISTING.md` | 🤖 | P2 | ☑ |
| 3.5 | Add review note: *"Virtual coins only. No real money. No payouts."* — drafted in `STORE_LISTING.md` | 🤖 | P2 | ☑ |

## 4. Performance & Hardening — nice to have

| # | Task | Owner | Priority | Status |
|---|------|-------|----------|--------|
| 4.1 | **Code-split** the JS bundle (lazy-load games) — main chunk 637 kB → 206 kB | 🤖 | P3 | ☑ |
| 4.2 | Test on a **real low-end Android** device | 👤 | P3 | ☐ |
| 4.3 | Run `npm run cap:sync` and smoke-test the **Android build** — sync verified OK | 🤝 | P3 | ◐ |

## 5. Post-Android — iOS (deferred)

| # | Task | Owner | Priority | Status |
|---|------|-------|----------|--------|
| 5.1 | `npm install @capacitor/ios` + `npx cap add ios` | 🤖 | P4 | ☐ |
| 5.2 | iOS icon (1024×1024, no alpha) + iPhone/iPad screenshots | 👤 | P4 | ☐ |
| 5.3 | Archive & upload via Xcode (needs Mac + Apple Developer $99/yr) | 👤 | P4 | ☐ |

---

## Recommended order of work
1. **Quick code wins** (3.1, 3.2) — fast, low-risk, I can do now.
2. **Privacy policy** (1.1) — unblocks the single most common rejection.
3. **Coin-logic tests** (2.1) — protects the in-game economy.
4. **Design assets** (1.2–1.4, 3.3) — your task; needed for the listing.
5. **Content rating + signed AAB** (1.5, 1.6) — final steps before upload.

## Privacy Policy (Task 1.1) — notes
- **Page written:** `public/privacy-policy.html` (self-contained, mobile-friendly, dark theme).
- **Accurate to the app:** collects no personal data; only on-device localStorage (wallet, high scores, optional nicknames). No ads, analytics, or third parties.
- **Live URL (after merge to `main`):** `https://rawatvijay188.github.io/miniGames/privacy-policy.html`
  - The Pages deploy workflow runs on `main` / `firstAppDeployment`, so the URL goes live once this is merged to `main` (or run the workflow manually).
- **Remaining for you:** verify the contact email (`rawatvijay1051@gmail.com`) is correct, then paste the live URL into Play Console → Store listing → Privacy policy.

## App Icon & Feature Graphic (Tasks 1.2 / 1.3) — notes
- **Source art:** editable SVGs in `assets/` (`icon-foreground.svg`, `icon-background.svg`, `feature-graphic.svg`) — a neon 2×2 "mini games" grid on a dark arcade gradient.
- **Pipeline:** `npm run icons` (sharp) regenerates everything from the SVGs:
  - all Android densities under `android/app/src/main/res/mipmap-*/` (legacy + round + adaptive foreground)
  - `public/icon-512.png` (Play Store listing icon)
  - `public/icon-1024.png` (master / iOS later)
  - `public/feature-graphic.png` (1024×500)
- Adaptive-icon background color set to dark `#15123A` (was white).
- **Icon art (2026-07-02):** reworked to a single **gold coin hero** (embossed star + inner ring) with cyan/magenta neon accent sparkles — reads clearly at 48px and sits inside the adaptive-icon safe zone (the old 2×2 grid bled into the masked corners). Source: `assets/icon-foreground.svg`.
- **Status = ◐ provisional:** the art is clean and shippable. Swap the SVGs and re-run `npm run icons` if you want fully custom art before launch. Then use `public/icon-512.png` and `public/feature-graphic.png` in the Play Console listing.

## Coin-Logic Tests (Task 2.1) — notes
- Pure wallet logic extracted to `src/context/walletCore.js`; `CoinContext.jsx` is now a thin React/localStorage wrapper (public API unchanged — all games still use `useCoins()`).
- 33 Vitest cases in `src/context/walletCore.test.js` cover streak math, the bankruptcy-refill anti-abuse guard, balance clamping, and corrupt-storage handling.
- Run with `npm test` (watch) or `npm run test:run` (CI).

## Real-Money Audit (Task 2.3) — result: PASS
- No payment/billing/IAP SDKs in dependencies; no `BILLING` permission in the manifest.
- No payment provider references (Stripe/PayPal/etc.) in code — apparent matches were `stripEl` (reel animation) and an in-game virtual `cashOut`.
- Zero network calls in app code; only the default (unused) `INTERNET` permission is present.
- Conclusion: the app is fully self-contained and consistent with "virtual coins only, no real money, no data leaves the device."

## Splash Screen (Task 3.3) — notes
- Generated by the same `npm run icons` pipeline: dark arcade gradient + centered logo, written to every `drawable*/splash.png` (portrait + landscape, all densities). Source is the existing `assets/` SVGs.

## Definition of "ready to submit"
All of **Section 1** ☑ · all of **Section 2** ☑ · Section 3 ☑.
Sections 4–5 may ship in a later update.
