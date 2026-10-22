# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

React 19 + TypeScript + Vite frontend for JaviGG, a League of Legends stats site (U.GG/Blitz-style). It is deployed on Vercel at https://www.javigg.com. The Spring Boot API lives in the sibling repo `../javigg`.

## Commands

```bash
npm install
npm run dev       # http://localhost:5173; proxies /summoner and /live-game to localhost:8080
npm run build     # tsc -b && vite build (typecheck is part of the build)
npm run lint      # eslint flat config: typescript-eslint + react-hooks + react-refresh
npm run preview   # serve the production build
```

No test framework is set up. To verify a change, run `npm run build` and `npm run lint`, then exercise the feature against a running backend.

## Architecture

- **API access.** Requests are made with plain `fetch` in `App.tsx` against `${import.meta.env.VITE_API_URL ?? ''}`. In dev the variable is unset and Vite's proxy (`vite.config.ts`) forwards requests to the backend. In production, `VITE_API_URL` must point at the deployed API, and that origin must be listed in the backend's `allowed.origins`. A new backend route also needs a new proxy entry in `vite.config.ts` for dev.
- **Region.** `services/regions.ts` mirrors the backend's `riot/Region.java` platform codes — keep the two in sync. `CombinedSearchBar` has a region `<select>` prepended to the search inputs, defaulted via `guessRegion()` (a timezone-based best guess, falling back to NA1). Both `/summoner` and `/live-game` calls in `App.tsx` carry `region`; the region a profile was searched with is kept in `searchRegion` state so a later live-game lookup targets the same shard. Recent searches store their region too (`services/recentSearches.ts`).
- **State and routing.** `App.tsx` holds all app state and the response TypeScript interfaces (`SummonerData`, `MatchDto`, `ParticipantDto`, `LiveGameLobbyDto`, …). Those interfaces mirror the backend's untyped `/summoner` map and Riot's Match v5 shape by hand, so update them whenever the backend response changes. There is no router: pages switch through a `currentPage` state (`'home' | 'champions'`) driven by `LeftNav`.
- **Components.** Each lives in `src/components/<Name>/` as `<Name>.tsx`, `<Name>.css` and an `index.ts` barrel. Styling is plain CSS files (no CSS modules or framework), with Rajdhani/Inter loaded from Google Fonts in `index.html`.
- **Data Dragon.** Static game data (champions, summoner spells, runes) is imported directly as JSON from `resources/datadragon/data/en_US/`, which sits outside `src/`. The singleton services in `src/services/` map Riot IDs to names and image URLs. `championService` dynamically imports per-champion JSON to get skin lists. Images are loaded from the Data Dragon CDN; the patch version is pinned in `src/constants.ts` (`DDRAGON`), and the backend's `DataDragonService` pins the same version separately.
- **Recent searches.** These persist to `localStorage` (`javigg_recent_searches`, max 10) through `services/recentSearches.ts`.
- **Build settings.** React Compiler is enabled through `babel-plugin-react-compiler` in `vite.config.ts`, so manual `useMemo`/`useCallback` is mostly unnecessary.
- **Riot verification file.** `public/riot.txt` is Riot's production-key domain verification file, served at `/riot.txt`. Don't delete or reformat it: it must contain exactly the code with no trailing newline.
- **API errors.** The backend returns ProblemDetail errors: 400 for bad input, 404 for an unknown Riot ID or a player not in game, 502 when Riot fails, and 503 with `Retry-After` when rate limited. `apiErrorMessage` in `App.tsx` turns these into user-facing text.
- **Security headers.** `vercel.json` sets them for the deployed site. There is no CSP yet; adding one requires allowing the API origin, `ddragon.leagueoflegends.com` and Google Fonts.
