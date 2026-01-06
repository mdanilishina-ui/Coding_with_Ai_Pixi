# Coding with AI · Pixi Platform

A tiny monorepo that keeps the shared platform shell beside individual PixiJS games. The server at the repo root serves everything statically so each game package can stay framework-free.

## Repository layout
```
packages/
  platform/        # iframe-based menu + loader shell
  game-sdk/        # shared GameInterface contract
  games/
    warm-cold/     # existing Save the Rabbit experience (HTML/CSS/JS/assets)
server.js          # lightweight static server (unchanged)
```

The warm/cold prototype keeps its original logic under `packages/games/warm-cold`. Only the paths changed—no gameplay code was rewritten.

## Running locally
1. Install Node.js if needed.
2. Start the static server from the repo root:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:4173/` and you will land on the platform UI (the root `index.html` now redirects to `packages/platform/`).

You can also deep-link directly to `http://localhost:4173/packages/games/warm-cold/` if you want to work on the game outside of the platform shell.

## Adding a new game package
1. Copy `packages/games/warm-cold` as a template (or start from scratch) and keep its assets/docs within that folder.
2. Register the game with the platform loader by editing `packages/platform/main.js` and adding a new entry to the `games` array. Point `entry` to your HTML page and `docs` to the relevant agents file.
3. (Optional) Implement the `GameInterface` contract from `packages/game-sdk/GameInterface.js` if you plan to expose programmatic mounting instead of the iframe fallback.

With this structure the shared platform can evolve (menus, loaders, SDK hooks) while each game maintains its own dependencies and DOM.
