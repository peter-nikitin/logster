# Logster

Logster is a browser-only log viewer for uploading, inspecting, and persisting
JSON log datasets locally.

## Commands

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test:unit`
- `npm run test:unit:watch`
- `npm run test:coverage`
- `npm run test:e2e`

## CI/CD

Pull requests run the required CI gate in GitHub Actions:

- `npm run lint`
- `npm run test:unit`
- `npm run test:typecheck`
- `npm run build`

Pushes to `main` trigger a GitHub Pages deployment workflow that publishes the
production `dist/` output.

GitHub Pages must be configured to use `GitHub Actions` as the source for this
repository.

Local npm commands remain the source of truth for reproducing CI failures.

## Testing

Unit tests use `Vitest` and focus on business logic and presenter behavior.

Functional tests use `Playwright` and cover the core browser flows:

- upload a log file
- inspect rows in the table
- persist uploaded datasets
- restore stored datasets after reload
- delete stored datasets

Playwright is available for local/browser-functional coverage but is not part of
the required pull request CI gate yet.

## Environment Note

The current Vite toolchain in this repo requires Node `20.19+` or `22.12+`.
