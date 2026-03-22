# JaviGG — League of Legends Stats Client

A League of Legends summoner stats viewer inspired by U.GG and Blitz. Search any summoner to view their ranked standing, match history, per-game stats, and live game information.

## Features

- **Summoner search** — look up any NA summoner by Riot ID (`name#tag`)
- **Ranked badge** — displays solo/duo tier, LP, and win/loss record
- **Match history** — last 20 games with compact card layout
  - Queue type, result (Victory/Defeat), time ago, duration
  - Champion portrait with summoner spells and keystone rune
  - K/D/A with ratio, CS with CS/min, vision score
  - Item build (3×2 grid + trinket)
  - 5v5 participant grid
- **Expandable scoreboard** — inline accordion on each match card with full 10-player breakdown (KDA, CS/min, gold, damage bars, wards, items)
- **Live game** — view the current game of any summoner in-game, including champion, streak (HOT/COLD), and team composition
- **Champions page** — browse all champions with stats and splash art modal
- **Animated backdrop** — random champion splash art on the home screen

## Tech Stack

- React 19 + TypeScript
- Vite
- Data Dragon (Riot's CDN) for champion/item/spell/rune assets — bundled locally for offline support

## Getting Started

### Prerequisites

- Node.js 18+
- The [javigg](https://github.com/your-username/javigg) backend running on port 8080

### Install & run

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`. API requests are proxied to `http://localhost:8080` via Vite's proxy config.

### Build for production

```bash
npm run build
```

## Project Structure

```
src/
  components/
    CombinedSearchBar/   # Riot ID search input (name + tag)
    LeftNav/             # Sidebar navigation
    MatchCard/           # Match history card + inline scoreboard
    ChampionsPage/       # Champion browser with detail modal
  services/
    championService.ts   # Champion data lookup + skin URLs
    spellService.ts      # Summoner spell ID → image URL
    runeService.ts       # Keystone rune ID → image URL
  constants.ts           # Data Dragon base URL (version pinned here)
resources/
  datadragon/            # Bundled Data Dragon JSON assets (champions, spells, runes)
```

## Configuration

The Data Dragon version is centralized in `src/constants.ts`:

```ts
export const DDRAGON = 'https://ddragon.leagueoflegends.com/cdn/16.6.1';
```

Update this string to bump assets to a new patch.
