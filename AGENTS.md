# Repository Guidelines

## Project Structure & Module Organization

This repo packages the Vibe Coding Rank CLI, Cloudflare Worker, static report site, and Codex skill assets. Core runtime code lives in `src/`: `src/cli/vibe-rank.mjs` is the command-line entry point and `src/worker/index.js` serves report APIs and assets. The browser report UI is in `apps/report-site/`. Skill instructions, evidence scripts, references, and agent metadata live under `skill/`. Tests are in `tests/`, with JavaScript `.mjs` checks and Python `unittest` files. Deployment and product docs live in `docs/`, while `assets/` contains public images used by the README/site.

## Build, Test, and Development Commands

- `npm ci`: install Node dependencies exactly from `package-lock.json`.
- `npm run check`: run JS syntax checks, Worker/site tests, and Python unit tests.
- `npm run demo`: generate a demo rank report through the CLI.
- `npm run site`: serve `apps/report-site` at `http://localhost:4173`.
- `npm run deploy:dry-run`: validate the Cloudflare Worker deployment with Wrangler.
- `npm run deploy`: deploy the Worker and static assets.

## Coding Style & Naming Conventions

Use ES modules for JavaScript. Keep existing style: 2-space indentation, double quotes, semicolons, `camelCase` functions/variables, and uppercase constants for shared limits or field lists. Python scripts use 4-space indentation, `snake_case`, `pathlib`, and standard-library-first utilities. Keep report fields explicit and stable because tests assert exact JSON shapes and Chinese copy.

## Testing Guidelines

Run `npm run check` before handing off changes. Add JavaScript tests as `tests/test_*.mjs` when changing the Worker, CLI payloads, or report site behavior. Add Python tests as `tests/test_*.py` for `skill/scripts/`. Prefer focused assertions on privacy flags, payload shape, and user-visible copy because regressions here can leak local context or break shared links.

## Commit & Pull Request Guidelines

Recent commits use short imperative subjects such as `Add CLI doctor diagnostics` and `Validate CLI source option`. Follow that style: one concise sentence, capitalized verb first, no trailing period. PRs should describe the changed surface, include `npm run check` results, link related issues, and add screenshots or local URLs for report-site UI changes.

## Security & Configuration Tips

Treat raw AI session logs as private. Public report payloads must stay compact and sanitized: no snippets, local paths, roles, source files, tokens, or secrets. Cloudflare configuration is in `wrangler.toml`; do not change KV bindings, routes, or account details casually.
