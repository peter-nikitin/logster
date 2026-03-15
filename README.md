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

## Testing

Unit tests use `Vitest` and focus on business logic and presenter behavior.

Functional tests use `Playwright` and cover the core browser flows:

- upload a log file
- inspect rows in the table
- persist uploaded datasets
- restore stored datasets after reload
- delete stored datasets

## Environment Note

The current Vite toolchain in this repo requires Node `20.19+` or `22.12+`.
