# Task 11: CI/CD For PR Checks And GitHub Pages Release

## Product Increment

When I work on the repo, quality checks run automatically on pull requests and
the app is published automatically after changes are merged into `master`.

## Demo Result

Verify:

- opening a pull request triggers the validation workflow
- the workflow runs the agreed project checks and reports pass/fail status
- merging into `master` triggers a production deployment workflow
- the deployed app becomes available from GitHub Pages without manual steps

## Goal

Introduce a minimal, reliable GitHub Actions pipeline for validation and
deployment.

## Scope

- add a pull request workflow for repository checks
- run install, lint, unit tests, typecheck, and production build in CI
- decide whether Playwright runs in the default PR workflow or in a separate job
- add a deployment workflow that publishes the built app to GitHub Pages
- trigger deployment only from `master`
- make the Vite app compatible with GitHub Pages hosting path requirements
- document the workflow behavior and required repository settings

## Out Of Scope

- preview deployments for every pull request
- semantic versioning or package publishing
- multi-environment release promotion
- custom domain setup

## Workflow Direction

### Pull Request Checks

On every pull request:

- use a supported Node version matching the repo requirement
- install dependencies with `npm ci`
- run:
  - `npm run lint`
  - `npm run test:unit`
  - `npm run test:typecheck`
  - `npm run build`

Recommended decision:

- keep Playwright outside the first PR gate unless browser setup is already
  stable in CI
- if included, isolate it in a separate job so failures are easier to diagnose

### Release To GitHub Pages

On push to `master`:

- build the production app
- upload the static site artifact
- deploy it with the official GitHub Pages Actions flow
- avoid manual `gh-pages` branch scripting when native Pages deployment is
  sufficient

## Functional Requirements

### 1. PR Validation Workflow

- workflow file lives under `.github/workflows/`
- trigger on `pull_request`
- fail the workflow when any required check fails
- keep jobs readable and deterministic

### 2. GitHub Pages Deployment Workflow

- trigger on pushes to `master`
- deploy the production `dist/` output
- use GitHub permissions required for Pages deployment only
- prevent accidental deployment from feature branches

### 3. Static Hosting Compatibility

- confirm whether Vite `base` must be set for the repository Pages URL
- avoid broken asset paths after deployment
- ensure refresh and direct-load behavior remain acceptable for the app shape

### 4. Documentation

- update `README.md` with CI/CD commands and deployment notes
- document any required GitHub repository settings:
  - Pages source as GitHub Actions
  - required branch name `master`
  - any environment or permission expectations

## Acceptance Criteria

- a GitHub Actions PR workflow exists and runs the required checks
- the PR workflow installs dependencies with `npm ci`
- lint, unit tests, typecheck, and build run successfully in CI
- a GitHub Actions deployment workflow exists for pushes to `master`
- deployment publishes the built app to GitHub Pages
- the built app resolves its assets correctly from the GitHub Pages URL
- the repository documentation explains how CI and deployment work

## Suggested Technical Work

### GitHub Actions

Suggested files:

```text
.github/workflows/ci.yml
.github/workflows/deploy-pages.yml
```

Possible shape:

- `ci.yml`
  - trigger: `pull_request`
  - checkout
  - setup Node
  - cache npm
  - `npm ci`
  - lint
  - unit tests
  - typecheck
  - build
- `deploy-pages.yml`
  - trigger: push to `master`
  - checkout
  - setup Node
  - `npm ci`
  - build
  - configure Pages
  - upload artifact
  - deploy

### Vite Configuration

Likely follow-up:

- set `base` in `vite.config.ts` for the repository Pages path
- prefer a configuration that can still work locally without awkward commands

### Documentation

Update:

- local commands in `README.md`
- CI coverage summary in `README.md`
- deployment expectations in `README.md`

## Risks

- GitHub Pages deployments will break if the Vite base path is wrong
- Playwright may add CI flakiness if browsers and storage behavior are not set up
- deployment can silently target the wrong branch if `main` and `master` are mixed

## Recommended Implementation Order

1. Add PR workflow with lint, unit test, typecheck, and build
2. Verify the Node version and install strategy in CI
3. Add Pages deployment workflow for pushes to `master`
4. Update Vite base-path handling for Pages
5. Update `README.md` with CI/CD behavior and repo setup notes
6. Confirm the deployed app loads correctly from the Pages URL
