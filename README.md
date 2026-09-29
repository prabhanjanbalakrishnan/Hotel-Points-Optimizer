# Hotel Points Optimizer

A hotel loyalty points optimizer. Add the loyalty programs you belong to, tell it where you're headed, and get a straight answer on how your points stack up — roughly how many points a night costs at different property tiers, whether cash or points is the better deal, and what your elite status actually unlocks.

**Live:** [hotel-points-optimizer.vercel.app](https://hotel-points-optimizer.vercel.app)

## What it does

- **Add your memberships** — chain, optional points balance, optional elite tier. Nothing is saved anywhere; it lives in your browser for the session only.
- **Type a destination** (or pick one from a grouped dropdown of popular US, Indian, and international spots) and get a per-chain breakdown: expected property tier, points-per-night range, a cash-vs-points rule of thumb, and the perks your current tier unlocks.
- **Explore Destinations** — don't know where you're headed yet? Pick your hometown from a grouped city dropdown and browse destinations sectioned into Domestic, the other country's, and International, each showing which of your programs have good presence there.
- **More Hotel Info** (`/hotels`) — a full reference browser for all 12 chains: sub-brand families (each one expandable with a positioning blurb and a link to that brand's own site), the complete elite tier ladder, and how each program's redemption math actually works.

## Chains covered

**US-origin:** Hilton Honors, Marriott Bonvoy, World of Hyatt, IHG One Rewards, Wyndham Rewards, Choice Privileges, Radisson Rewards
**India-origin:** Lemon Tree Infinity Rewards, Sarovar Rewardz, Taj InnerCircle-NeuPass, Club ITC, Oberoi One

Three different program models are represented honestly rather than forced into one shape: traditional **redemption charts** (points-per-night ranges), **cashback currencies** (Taj, Club ITC — 1 point = 1 unit of local currency), and a **flat discount tier** (Oberoi One has no points balance at all).

## Scope, on purpose

- **No live hotel data or scraping.** Loyalty programs don't offer public APIs and prohibit automated access in their terms — every chain's data is hand-compiled and reflects general program terms, not real-time pricing or availability.
- **Chain-level guidance, not a booking engine.** Results never name a specific bookable property — that would require exactly the live-data problem above. Each result ends with a link to the chain's own real search page so you can book with your own account.
- **Session-only.** No accounts, no localStorage, no tracking. Refresh mid-flow and you start over — that's intentional.

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) (plain JS/JSX, no TypeScript)
- `react-router-dom` (`HashRouter`, so it needs no server-side routing config to deploy)
- [oxlint](https://oxc.rs/) for linting
- No backend — fully static, deployed on [Vercel](https://vercel.com/)
- Hand-curated JSON datasets for chains, elite tiers, and destinations — no external APIs at runtime

## Getting started

```bash
cd app
npm install
npm run dev
```

The dev server runs on `http://localhost:5174`.

Other commands (all run from `app/`):

```bash
npm run build     # production build
npm run lint      # oxlint
npm run preview   # preview the production build
```

## Deployment

Deployed on Vercel with **Root Directory set to `app`**. Auto-deploys on every push to `main`. No environment variables are required — the app is fully static.

## Project structure

```
app/
├── src/
│   ├── data/          # hand-curated JSON: chains, destinations, city lists
│   ├── components/    # CityPicker, ChainResultCard, TierLadder, BrandChip, ...
│   ├── pages/          # Home, Memberships, Destination, Explore, Results, Hotel Info
│   ├── context/        # session-only React state (useReducer, no persistence)
│   └── utils/          # points math, region matching, distance calculations
└── public/
```

## Contributing / questions

This is a personal project built iteratively with Claude Code — see `CLAUDE.md` for the detailed design log (why each decision was made, what tradeoffs were considered, and what's explicitly out of scope). If you're poking around the code, that file is the best place to understand the "why" behind anything that looks unusual.
