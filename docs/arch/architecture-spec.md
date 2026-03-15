# Logster Architecture Spec

## Purpose

This document defines the development architecture for Logster.

It exists to keep the product easy to evolve while adding:

- bundled file viewing
- table-based inspection
- local file upload
- browser storage
- later analysis features such as slow-operation ranking and file comparison

## Deployment Constraint

Logster must run entirely in the browser.

Explicit rules:

- no backend
- no server-side rendering
- no API server
- no database outside browser storage
- no server-dependent authentication

Target hosting model:

- static hosting on GitHub Pages

Implication:

- the full product must work as a client-only application built into static assets
- all import, parsing, storage, filtering, and analysis must execute in the browser

## Architecture Goals

- clear domain separation
- hexagonal architecture boundaries
- thin view layer with minimal logic
- storage isolated from business logic
- replaceable infrastructure adapters
- predictable growth from single-file viewer to multi-file analysis
- full functionality in a browser-only deployment

## Architecture Style

The application should follow a frontend-friendly hexagonal architecture.

Core idea:

- domain and application logic must not depend on React, browser storage, or UI-library components
- external concerns must be connected through ports and adapters

## High-Level Layers

### 1. Domain

Contains pure business concepts and rules.

Examples:

- `LogRow`
- `LogDataset`
- dataset metadata
- parser validation rules
- time-gap calculation rules
- filtering rules
- summary metric calculations

Rules:

- pure TypeScript
- no React imports
- no browser APIs
- no UI-library imports

### 2. Application

Contains use cases that orchestrate domain logic and ports.

Examples:

- import bundled dataset
- import uploaded file
- save dataset to storage
- restore last active dataset
- select active dataset
- filter dataset rows

Rules:

- can depend on domain
- can depend on port interfaces
- cannot depend on concrete adapters
- should stay framework-agnostic where possible

### 3. Ports

Ports define the interfaces the application core uses to talk to the outside world.

Examples:

- `DatasetRepository`
- `BundledDatasetSource`
- `Clock`
- `IdGenerator`

Rules:

- define contracts only
- no implementation details

### 4. Adapters

Adapters implement ports for concrete technologies.

Examples:

- bundled JSON file adapter
- IndexedDB dataset repository
- browser file-reader adapter
- local date formatting adapter if needed

Rules:

- may depend on browser APIs
- may depend on infrastructure libraries
- may map external data into domain types
- must not contain UI logic

### 5. View

The view layer renders state and emits user intents.

Examples:

- app shell
- dataset list
- upload button
- table
- filters panel
- row details drawer

Rules:

- React components should be presentational by default
- components should receive prepared view models and callbacks
- no parsing logic in components
- no storage logic in components
- no domain calculations embedded in JSX

## Required Separation

The following dependencies are allowed:

- `view -> application`
- `application -> domain`
- `application -> ports`
- `adapters -> ports`
- `adapters -> domain`

The following dependencies are not allowed:

- `domain -> React`
- `domain -> adapters`
- `application -> IndexedDB`
- `application -> UI library`
- `view -> IndexedDB`
- `view -> parser internals`

## Proposed Source Structure

Suggested structure:

```text
src/
  app/
    use-cases/
    services/
    ports/
    state/
  domain/
    log-dataset/
      entities/
      value-objects/
      services/
  adapters/
    bundled-datasets/
    file-import/
    storage/
    ids/
    time/
  components/
    ui/
  ui/
    components/
    screens/
    presenters/
    hooks/
  lib/
    utils/
  shared/
    types/
    utils/
```

Notes:

- `domain/` is pure business logic
- `app/` coordinates use cases and state transitions
- `adapters/` contains concrete implementations
- `components/ui/` contains generated or locally owned `shadcn/ui` primitives
- `ui/` contains React components and presentation mapping only
- `lib/utils/` can hold framework-level helpers such as `cn` for class composition

## Recommended UI Foundation

Use `shadcn/ui` as the primary UI foundation.

Reason:

- it fits the architecture goal of keeping the view layer composable and easy to evolve
- components are added as source code, which keeps the design system open for local modification
- it works well with Vite and static browser-only deployments
- it provides accessible building blocks for tables, drawers, dialogs, inputs, and layout primitives

Guidelines:

- treat `shadcn/ui` as generated component source, not as opaque infrastructure
- keep generated primitives in a dedicated local area such as `src/components/ui`
- compose product-specific view components in `src/ui/components`
- do not spread Tailwind or primitive-specific decisions into application logic
- keep business decisions outside component props whenever possible
- prefer adding only the minimum set of primitives needed for the current increment

## Styling Approach

Use Tailwind CSS together with `shadcn/ui` tokens and utility classes.

Rules:

- keep Tailwind usage in the view layer only
- do not place Tailwind-specific assumptions in domain or application code
- centralize reusable class composition in view helpers or local wrapper components when repetition appears
- use CSS variables for theme tokens when shared styling semantics matter across components

## State Management Approach

Use simple React state and custom hooks first.

Rules:

- keep application state near the app boundary
- represent async states explicitly: `idle`, `loading`, `success`, `error`
- avoid global state libraries unless the current scope proves they are necessary

Recommended split:

- application-facing hooks in `ui/hooks` call use cases
- hooks may coordinate UI state, but calculation-heavy logic stays in application or domain services

## View Layer Rules

The view layer must stay intentionally dumb.

Allowed in view:

- rendering
- local UI concerns such as open/closed panels
- invoking callbacks
- formatting already-prepared values for display

Not allowed in view:

- parsing raw JSON
- computing normalized rows
- filtering business data inline in components
- reading or writing IndexedDB directly
- computing summary metrics inside render functions

If logic feels reusable or testable, it likely belongs outside the view layer.

## Presentation Mapping

Use presenters or mappers between application/domain data and component props.

Examples:

- map `LogDataset` to table rows
- map summary metrics to stat cards
- map parser or storage errors to user-facing messages

Benefits:

- components remain simple
- UI wording can change without touching domain logic
- easier testing of rendering vs business rules

## Storage Isolation

Storage must be completely isolated behind a repository port.

Recommended port:

```ts
interface DatasetRepository {
  list(): Promise<DatasetMeta[]>
  get(id: string): Promise<LogDataset | null>
  save(dataset: LogDataset): Promise<void>
  remove(id: string): Promise<void>
  getLastActiveId(): Promise<string | null>
  setLastActiveId(id: string): Promise<void>
}
```

Primary adapter:

- `IndexedDbDatasetRepository`

Rules:

- no React component may call IndexedDB directly
- no use case may know IndexedDB schema details
- storage errors must be mapped into application-level errors
- no storage design may assume a remote persistence fallback

## File Import Isolation

File import should also be isolated behind an adapter boundary.

Suggested flow:

1. View triggers file selection.
2. File adapter reads file contents.
3. Application use case passes raw text to domain parser.
4. On success, application saves through repository port.
5. View receives updated state.

This keeps browser file APIs out of the core logic.

## Serverless Constraint

The architecture must assume there is no server now and no server later as part of the main product path.

That means:

- no feature may require a network round-trip to function
- no domain or application flow may depend on remote APIs
- any optional future integration must remain outside the core product path

If a future idea cannot work on static hosting in the browser, it does not fit this architecture without an explicit product change.

## Bundled Dataset Isolation

Bundled example files should be treated as another external source, not as a special case inside the domain.

Use a separate port or adapter for:

- listing bundled files
- loading bundled file contents

This makes bundled files and uploaded files converge into the same import path after raw content is obtained.

## Domain Services

The following logic should exist as domain services or pure application helpers:

- parse raw log rows into `LogDataset`
- compute `deltaMs`
- derive unique methods
- apply filters
- compute summary metrics
- rank large time gaps

These services must be reusable by:

- bundled file import
- uploaded file import
- stored dataset restore
- future comparison features

## Error Model

Errors should be normalized before they reach the view.

Recommended categories:

- `ParseError`
- `ValidationError`
- `StorageError`
- `RestoreError`
- `ImportError`

The UI should render friendly messages from mapped error types rather than raw exceptions.

## Testing Strategy

### Domain Tests

Highest priority.

Test:

- parsing
- delta calculation
- filtering
- summary metrics

### Application Tests

Test:

- import flows
- restore flows
- repository interaction
- error mapping

### View Tests

Keep narrower.

Test:

- components render expected states
- user actions trigger the correct callbacks

## Architecture Constraints

The following are mandatory:

- no business logic inside JSX-heavy components
- no direct IndexedDB usage outside storage adapters
- no parser logic inside upload handlers beyond orchestration
- no domain types importing UI-library types
- no adapter-specific code imported into domain

## Planned Evolution

This architecture should support future increments without structural rewrite:

- slowest-operation analysis
- multiple stored datasets
- two-file comparison
- method-level aggregates
- export of filtered data

Those features should extend domain services and application use cases, not bypass them in the view layer.
They must also remain compatible with static browser hosting unless the product constraints are intentionally changed.

## Definition Of Done For Architecture Compliance

A feature is architecture-compliant when:

- business rules are implemented outside React components
- storage is accessed only through repository ports
- adapters are replaceable without changing domain code
- UI components mostly render props and trigger intents
- the same domain services can be reused by bundled, uploaded, and restored datasets
- the feature works in a browser-only static deployment such as GitHub Pages
