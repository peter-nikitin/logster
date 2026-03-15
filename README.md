# Logster

Logster is a browser-only log viewer for uploading, inspecting, filtering, and
persisting JSON log datasets locally. It runs as a static Vite app and does not
require a backend.

Live demo: `https://peter-nikitin.github.io/logster/`

## What It Does

- opens bundled example datasets
- imports JSON log files from the local machine
- persists uploaded datasets in browser storage
- restores the last active uploaded dataset after reload
- filters rows by method and message
- shows row details alongside the dataset table

## Local Development

### Requirements

- Node `22.12+` (recommended stable default)
- npm `10+`

### Setup

```bash
npm ci
```

### Run The App

```bash
npm run dev
```

Vite prints the local development URL after startup.

## Available Commands

- `npm run dev` starts the Vite development server
- `npm run build` runs TypeScript build checks and produces a production bundle
- `npm run preview` serves the built app locally
- `npm run lint` runs ESLint
- `npm run test` runs the unit test suite
- `npm run test:unit` runs Vitest once
- `npm run test:unit:watch` runs Vitest in watch mode
- `npm run test:coverage` runs Vitest with coverage
- `npm run test:e2e` runs Playwright browser tests
- `npm run test:typecheck` typechecks the test setup

## CI/CD

Pull requests run the required GitHub Actions validation workflow:

- `npm run lint`
- `npm run test:unit`
- `npm run test:typecheck`
- `npm run build`

Pushes to `main` trigger the GitHub Pages deployment workflow, which publishes
the production `dist/` output.

GitHub Pages must be configured to use `GitHub Actions` as the deployment
source for this repository.

## Testing

Vitest covers business logic, parsing, storage flows, and presenter behavior.

Playwright covers the main browser workflows:

- uploading a dataset
- inspecting rows in the table
- persisting uploaded datasets
- restoring stored datasets after reload
- deleting stored datasets

Playwright is available for local functional coverage, but it is not part of
the required pull request CI gate yet.
