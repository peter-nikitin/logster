# Task 10: Screen Refactor With Collapsible Sidebar And Adjustable Columns

## Product Increment

When I use the app, the screen feels more like a real workspace:

- the oversized header is removed or minimized
- the dataset list and upload area live in a hideable sidebar
- the main content area is focused on the table and row details
- column widths can be adjusted by the user

## Demo Result

Open the app and verify:

- the screen opens into a compact working layout instead of a hero-style header
- the dataset list and upload control are placed in a sidebar
- the sidebar can be hidden and reopened
- the table remains usable when the sidebar is hidden
- table columns can be resized by the user

## Goal

Refactor the current screen into a denser, more practical log-viewer workspace.

## Scope

- reduce or remove the large top header
- move dataset list and upload UI into a collapsible sidebar
- keep stored datasets and upload actions in that sidebar
- keep the main area dedicated to table and row details
- add adjustable table column widths
- introduce `zustand` for UI state management
- split state into small focused stores instead of one broad store

## Out Of Scope

- new filtering logic
- new analysis features
- multi-window layouts
- persistence of every UI preference unless needed for this task

## Architecture Direction

### State Management

Use `zustand` for UI-facing state in this task.

Rules:

- use small stores by concern
- avoid a single global catch-all store
- keep domain logic and use cases outside the stores
- stores should coordinate UI state, selection state, and layout state only

Recommended store split:

- `layout store`
  - sidebar open/closed
  - sidebar width if needed
  - table column widths
- `active dataset store`
  - active dataset id
  - active row id
- `storage/ui status store`
  - import pending
  - restore pending
  - user-visible error state

Notes:

- if existing hook logic is still useful, move orchestration gradually instead of rewriting everything at once
- `zustand` should not replace domain or application modules

### Layout Direction

The screen should behave like an app workspace, not a landing page.

Target structure:

```text
+---------------------------------------------------------------+
| compact top bar / toolbar                                     |
+----------------------+----------------------------------------+
| collapsible sidebar  | main content                           |
|                      |                                        |
| upload               | resizable table                        |
| stored datasets      |                                        |
| other sources        | row details                            |
|                      |                                        |
+----------------------+----------------------------------------+
```

## Functional Requirements

### 1. Compact Header / Toolbar

- remove the large hero-style heading block
- keep only the minimum useful top chrome
- toolbar may contain:
  - app title
  - sidebar toggle
  - current dataset name
  - row count or source badges if useful

### 2. Collapsible Sidebar

- the left panel should contain:
  - upload drop zone
  - stored datasets
  - other dataset sources if still present
- the sidebar must be hideable
- the sidebar must be reopenable without reloading
- the main content must expand when the sidebar is hidden

### 3. Adjustable Table Columns

- columns should be user-resizable
- at minimum support resizing:
  - time
  - delta
  - method
  - message
  - payload
- resizing should not break row rendering or selection
- widths should remain readable and constrained by sensible minimums

### 4. Main Content Focus

- the table should become the visual center of the screen
- row details should stay visible in a stable secondary area
- hiding the sidebar must not hide the active dataset content

## Acceptance Criteria

- the large decorative header is removed or substantially reduced
- upload and dataset list are moved into a sidebar
- the sidebar can be collapsed and reopened
- the table expands into the available space when the sidebar is collapsed
- table column widths can be adjusted manually
- row selection still works
- stored dataset behavior still works
- upload still works
- browser restore still works
- UI state is managed with `zustand` stores split by concern

## Suggested Technical Work

### UI Refactor

- replace the current stacked page layout with a workspace shell
- introduce a compact toolbar
- move dataset source panel into a sidebar shell component
- add sidebar toggle affordance in the toolbar

### Column Resizing

Possible implementation paths:

1. native custom resizing with pointer events
2. a small table-resize library if it stays lightweight and does not hijack the architecture

Preferred:

- start with a small local implementation if complexity stays controlled
- if using a helper library, keep it isolated in UI components

### Zustand Stores

Suggested file structure:

```text
src/
  ui/
    stores/
      layout-store.ts
      active-dataset-store.ts
      status-store.ts
```

Possible responsibilities:

- `layout-store.ts`
  - `isSidebarOpen`
  - `toggleSidebar`
  - `columnWidths`
  - `setColumnWidth`
- `active-dataset-store.ts`
  - `activeDatasetId`
  - `activeRowId`
  - selection setters
- `status-store.ts`
  - `isImporting`
  - `isRestoring`
  - `error`

## Refactoring Notes

- keep repository, parser, and use cases intact
- avoid moving persistence logic into UI components
- keep viewer behavior stable while layout changes
- preserve existing test ids or update them centrally if selectors change
- if screen concerns and data concerns are mixed inside the current hook, split them deliberately

## Risks

- resizing logic can get messy if mixed directly into the table render path
- a large store will become harder to reason about than the current hook
- hiding the sidebar can create broken empty states if width/layout constraints are weak

## Recommended Implementation Order

1. Introduce `zustand`
2. Extract small stores for layout, active selection, and status
3. Replace the large header with a compact toolbar
4. Move dataset sources into a sidebar container
5. Implement sidebar collapse / reopen behavior
6. Implement adjustable table columns
7. Verify upload, restore, row selection, and delete still work
8. Update tests for the new layout and selectors

## Testing Expectations

Unit or component-level coverage should protect:

- sidebar open/close state behavior
- column width update behavior
- store selectors and actions

Functional coverage should verify:

- upload works with sidebar open
- sidebar can be collapsed and reopened
- persisted datasets remain accessible
- row selection still updates details
- table remains usable after column resizing

## Done Definition

This task is done when:

- the screen is clearly refactored into a workspace layout
- the sidebar is hideable and reopenable
- dataset sources and upload live in the sidebar
- the table is the primary visual surface
- columns are resizable
- `zustand` small stores are used for UI state
- existing product behavior remains intact
