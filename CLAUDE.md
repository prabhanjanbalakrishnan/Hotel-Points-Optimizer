# Hotel Points Optimizer

## Project overview

A hotel loyalty points optimizer web app. Users add the hotel loyalty programs they belong to (Hilton, Marriott, Hyatt, IHG, Wyndham, Choice), type a destination, and get general redemption guidance per chain: roughly how many points a night costs at different property tiers, whether cash or points is the better deal, and what elite perks their tier unlocks.

Mirrors the sibling `Credit Card App Project` (static JSON dataset, no build-time data fetching, Vite + React + `HashRouter`, oxlint, no automated tests) with one departure: this app has a tiny backend (`app/api/track.js` + `app/api/stats.js`, backed by Upstash Redis) for anonymous aggregate analytics — counts of which chains get selected, no personal data attached.

**Deliberate scope boundaries** (see the full plan at `~/.claude/plans/i-want-to-build-declarative-twilight.md` for the reasoning):
- No live hotel data, no scraping — hotel loyalty programs prohibit automated access in their ToS and don't offer public APIs for this. All chain data in `app/src/data/chains.json` is hand-compiled and should be spot-checked/refreshed periodically, not treated as live.
- Results are **chain-level general guidance**, never named specific bookable properties — that would require exactly the live-data problem being avoided.
- Membership info entered by a user is **session-only** (in-memory React state via `OptimizerContext`) — no localStorage, no accounts. An account-based "remember me" feature is a possible future addition if there's demand, not built.

## Commands

All commands run from `app/`:

- `npm run dev` — start the Vite dev server (port 5174, `--strictPort`; the sibling project uses 5173, so both can run simultaneously without colliding)
- `npm run build` — production build
- `npm run lint` — oxlint
- `npm run preview` — preview the production build

Plain `npm run dev` does **not** execute `app/api/*.js` (Vite doesn't run serverless functions) — `/api/track` and `/api/stats` will 404 locally unless you install the Vercel CLI and run `vercel dev` instead, or just test them against a deployed Preview URL.

## Data (`app/src/data/chains.json`)

`{_meta, chains}` shape, one entry per chain with: `id`, `name`, `accentColor`, `brandFamily`, `eliteTiers` (name/qualification/perks), `redemptionGuidance` (`pricingModel` + `pointsPerNightByTier` across 4 property-tier buckets: Budget/Midscale, Upscale, Upper Upscale, Luxury), `pointValuation` (cents-per-point rule-of-thumb), `paymentFlexibility`, and `regionPresence` (Strong/Growing/Limited per one of 7 broad regions — used only for lightweight destination-relevance ranking via `app/src/data/regionMapping.js`, not real geolocation or property inventory).

`_meta.disclaimer` is shown on the results page — keep it in sync with reality: this data is hand-compiled and goes stale as programs change terms.

## Outbound booking links

Each chain entry also has a `bookingUrl` — its official top-level hotel-search page (e.g. `https://www.hilton.com/en/search/`). `ChainResultCard.jsx` renders this as a "Search real rooms on {chain}" link (`target="_blank"`, `rel="noopener noreferrer"`), with a hint line naming the user's typed destination so they can search for it themselves once they land on the chain's real site. The user then books directly with their own loyalty account — this app never displays live inventory or availability itself.

**These are deliberately the stable, top-level search pages, not deep links pre-filled with the destination.** I tried to verify real query-parameter formats (e.g. `?destinationAddress.destination=`) via both WebFetch and the Browser pane, and every major chain site (Hilton, Marriott, Hyatt) returned a bot-protection challenge page to both — and the one guess I could test end-to-end (Wyndham's `?query=`) silently returned "0 results" rather than erroring, which would have been a worse experience than no pre-fill at all. A real user's own browser won't hit that wall (it's targeting automation, not people), but there was no reliable way to confirm exact parameter names from here. If you happen to know the correct deep-link format for a chain (e.g. from a bookmarked search URL), it's safe to add it back in and should genuinely improve the hand-off.

## Anonymous analytics

`POST /api/track` takes `{chains: [ids]}` (ids only) and increments a Redis counter per chain; `GET /api/stats` returns the current counts for all 6 chains, zero-filled, and powers the public `/stats` page (`StatsPage.jsx` + `StatsChart.jsx`).

**Requires Upstash Redis env vars, not yet set up**: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Until a free Upstash database is created and these are set (in `app/.env.local` for local `vercel dev`, and in Vercel Project Settings for Production/Preview), both API routes will 500 and `/stats` shows a friendly "backend may not be configured yet" message rather than crashing — this is expected, not a bug.

## Deployment (not yet done)

Not yet pushed to GitHub or deployed. Follow the sibling project's pattern:
1. Create a new GitHub repo, push this repo directly.
2. Import into Vercel with **Root Directory = `app`** (must be set explicitly).
3. Grant the Vercel GitHub App access to the new repo via "Adjust GitHub App Permissions" on the Vercel new-project page — it won't appear in the import picker otherwise.
4. Set the two Upstash env vars in Vercel before expecting `/stats` or `/api/track` to work in production.
5. Auto-deploy on push to `main`.
6. Confirm a deep hash route works with no server-side rewrite (e.g. load `/#/stats` directly on the deployed domain).

## Known limitations / next steps

- Upstash account/database not yet created — analytics backend is wired up but non-functional until env vars are set (see above).
- Not yet pushed to GitHub or deployed to Vercel.
- `app/api/_chains.js` duplicates the chain id list from `src/constants.js` by design (client and serverless bundles build separately) — update both if a 7th chain is ever added.
- No automated tests, matching the sibling project's convention. Verified manually via the Browser pane: full membership → destination → results flow, region-match and no-match cases, mid-flow refresh (correctly redirects to `/memberships` since state is session-only), points math spot-checked against the data, no horizontal overflow at desktop or mobile widths.
- If usage feedback suggests people want their memberships to persist across visits, revisit the "session-only, no accounts" decision — it was deliberate for v1, not a limitation to silently fix.
