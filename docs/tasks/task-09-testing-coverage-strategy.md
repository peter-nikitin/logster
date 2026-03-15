# Technical Task: Testing Coverage Strategy

## Purpose

Define the first real testing strategy for Logster.

This task exists to make the current product behavior safe to evolve while the
app grows from:

- bundled example viewing
- local upload
- browser persistence and restore

into later filtering, comparison, and analysis features.

## Primary Testing Goals

1. Cover business logic with unit tests.
2. Cover core user flows with Playwright functional tests.
3. Keep tests aligned with behavior, not implementation details.
4. Use the minimum practical mocking needed to preserve confidence.

## Testing Philosophy

### Unit Tests: Boston Style

Use Boston-school TDD style for business logic.

Principles:

- a unit is a behaviorally meaningful slice, not just a single function
- prefer testing public behavior of a module or use case over private helpers
- isolate at system boundaries, not at every internal call
- mock ports and external boundaries only when they are the real behavior seam
- avoid mocking domain logic, presenters, or simple collaborators just to force isolation
- prefer real values and real data shapes over heavily synthetic stubs

For Logster, that means:

- domain parser tests should use real raw input payloads
- application use cases should usually use small in-memory repository doubles
- UI presenters should be tested as pure mapping functions
- React component tests are optional for this task and should stay secondary to unit and Playwright coverage

### Functional Tests: Playwright

Use Playwright for browser-level functional coverage.

Principles:

- cover real user journeys end to end
- verify behavior through the UI, not through internal state inspection
- use real browser storage behavior where possible
- prefer stable selectors and visible text over brittle DOM structure assertions
- keep the suite focused on critical product paths first

## Scope

### Included

- unit tests for domain services
- unit tests for application use cases
- unit tests for storage adapter behavior where practical
- unit tests for presenter output contracts
- Playwright tests for upload, table viewing, persistence, restore, reopen, and delete

### Out Of Scope

- snapshot-heavy component testing
- pixel-perfect visual regression
- exhaustive coverage for generated `shadcn/ui` primitives
- network mocking frameworks
- cross-browser matrix expansion beyond a pragmatic default

## Recommended Test Stack

### Unit Tests

Recommended:

- `Vitest`
- `@testing-library/react` only where a component test is truly needed

### Functional Tests

Recommended:

- `Playwright`

## Proposed Test Structure

```text
src/
  domain/
    ...
    __tests__/
  app/
    ...
    __tests__/
  ui/
    presenters/
      __tests__/
tests/
  e2e/
    storage-restore.spec.ts
    upload-and-view.spec.ts
    dataset-management.spec.ts
```

Alternative acceptable structure:

```text
src/**/tests/*.test.ts
tests/e2e/*.spec.ts
```

The exact folder layout matters less than keeping:

- unit tests close to domain/application behavior
- Playwright tests clearly separated as browser-functional coverage

## Product Invariants

These are the product truths that tests should protect.

### Parsing And Normalization

- raw log input must parse only from valid JSON
- the top-level input must be an array of rows
- each row must be an array
- each row must contain 3 or 4 items
- row item 1 must be a finite numeric timestamp
- row item 2 must be a non-empty string method/scope
- row item 3 must be a string message
- row item 4, when present, is treated as payload and preserved
- normalized rows must preserve source order
- each normalized row must receive a stable row id within the dataset
- the first row must have `deltaMs = null`
- every later row must have `deltaMs = current.timestamp - previous.timestamp`

### Uploaded Dataset Behavior

- uploaded files must use the same parser and normalized dataset model as bundled files
- importing a valid file must activate that dataset immediately
- invalid uploads must never crash the app
- invalid uploads must produce a readable error state

### Persistence Behavior

- uploaded datasets must be persisted to browser storage after successful import
- persisted datasets must remain available after reload
- restoring stored datasets must not require re-upload
- the last active stored dataset must be restored automatically when available
- deleting a stored dataset must remove it from the UI and browser storage
- deleting the active stored dataset must not leave the app in a broken state
- bundled datasets must not depend on browser storage for availability
- storage failures must surface as readable errors

### Viewer Behavior

- the table must render rows in source order
- the delta column must remain visible
- payload preview in the table must be truncated, not expanded inline
- selecting a row must show full row details
- row details must reflect the currently selected row only
- active dataset labeling must match the real origin of the dataset

## Unit Test Targets

### Domain

#### `parse-log-dataset.ts`

Cover:

- valid dataset with 3-item rows
- valid dataset with 4-item rows and payload
- invalid JSON
- non-array top-level JSON
- row not array
- row with too few items
- row with too many items
- invalid timestamp
- invalid method
- invalid message
- `deltaMs` for first row
- `deltaMs` for subsequent rows
- row id generation shape
- source order preservation

### Application Use Cases

#### `load-bundled-dataset.ts`

Cover:

- success path returns parsed dataset
- parser failure returns structured error

#### `load-uploaded-dataset.ts`

Cover:

- success path returns parsed dataset
- uploaded dataset id is generated
- parser failure returns structured error
- multiple uploads with the same filename do not collide in practice

#### `save-uploaded-dataset.ts`

Cover:

- repository save is called with normalized dataset
- last active id is updated to saved dataset id
- returned metadata is passed through correctly

Use a small in-memory repository fake, not deep mocks.

#### `restore-stored-datasets.ts`

Cover:

- returns metadata list
- returns null active dataset when no last active id exists
- restores the last active dataset when id exists
- returns null active dataset when last active id points to missing data

#### `delete-stored-dataset.ts`

Cover:

- repository remove is called with correct id

### Storage Adapter

#### `indexeddb-dataset-repository.ts`

Cover:

- save then get returns stored dataset
- list returns stored metadata
- remove deletes dataset
- `setLastActiveId` then `getLastActiveId` round-trips
- removing the last active dataset clears last active id

Notes:

- use real IndexedDB in test environment if feasible
- if a browser-like IndexedDB polyfill is needed, keep it thin and shared
- do not mock the repository internals

### Presenters

#### `present-log-row.ts`

Cover:

- time formatting shape
- first-row delta label
- subsequent-row delta label
- payload preview for missing payload
- payload preview truncation for long payload

#### `present-row-details.ts`

Cover:

- timestamp detail formatting
- delta detail formatting
- raw JSON rendering shape

## Playwright Functional Scenarios

### 1. Upload And View

Scenario:

- open app
- upload a valid JSON file
- verify uploaded dataset becomes active
- verify table renders rows
- verify payload preview is visible
- click a row
- verify row details update

### 2. Invalid Upload

Scenario:

- open app
- upload invalid JSON
- verify readable error state appears
- verify app does not crash

### 3. Persist After Reload

Scenario:

- open app
- upload valid JSON
- verify stored upload appears in sidebar
- reload page
- verify stored upload is still listed
- verify it can be reopened

### 4. Restore Last Active Dataset

Scenario:

- open app
- upload valid JSON
- ensure uploaded dataset is active
- reload page
- verify the same stored dataset is restored automatically
- verify table and details remain usable

### 5. Delete Stored Dataset

Scenario:

- open app
- upload valid JSON
- verify it appears in stored uploads
- delete it
- verify it disappears from the sidebar
- reload page
- verify it does not return

### 6. Multiple Stored Uploads

Scenario:

- open app
- upload file A
- upload file B
- verify both appear in stored uploads
- switch between them
- verify table content changes accordingly

### 7. Delete Active Stored Dataset

Scenario:

- open app
- upload a file
- ensure it is active
- delete it
- verify the app falls back safely
- verify no broken active-state UI remains

### 8. Storage Isolation

Scenario:

- open app with no stored uploads
- verify bundled dataset behavior still works
- upload file
- verify storage-backed uploads and bundled datasets coexist correctly

## Test Data Guidance

- keep at least one small valid log fixture
- keep one valid fixture with payload-heavy rows
- keep one invalid JSON fixture
- keep one structurally invalid parsed fixture
- avoid giant fixtures for unit tests unless behavior specifically requires them

## Definition Of Done

This task is done when:

- unit tests cover the current domain parser behavior
- unit tests cover current application use cases
- unit tests cover presenter behavior
- storage adapter behavior has automated coverage
- Playwright covers the main upload, restore, reopen, and delete flows
- tests run in CI or at least through documented local commands
- test failures clearly identify behavioral regressions

## Expected Deliverables

- test runner setup for unit tests
- Playwright setup for e2e tests
- initial test fixtures
- unit coverage for business logic
- Playwright coverage for core product flows
- documented test commands in `README.md`

## Suggested Follow-Up

After this task lands, update the architecture spec with a short testing section
that standardizes:

- Boston-style unit philosophy
- minimal-mock policy
- Playwright as the functional test tool
- expectations for new feature invariants before implementation expands further
