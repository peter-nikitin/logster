# Task 02: Table View For Active Dataset

## Product Increment

When I click a bundled file, I see its rows in a readable table instead of raw JSON.

## Demo Result

Open the app and verify:

- bundled file list still works
- the selected file opens into a table
- each row is readable without opening raw JSON manually

## Goal

Turn the parsed dataset into a usable first-pass viewer.

## Scope

- replace the raw JSON preview with a table view
- render columns for time, delta, method, message, and payload preview
- keep source order
- support row selection
- show full row content in a simple details area or raw JSON panel

## Out Of Scope

- custom upload
- browser storage
- full filtering system

## Acceptance Criteria

- clicking a bundled file shows a table
- rows are readable and visually separated
- the delta column is visible
- payload preview is truncated in the table
- clicking a row shows fuller row details

## Notes

- this task should already feel like a basic log viewer
- the UI can still be simple as long as the table is clearly usable

## Implementation Plan

This task should extend the current bundled-file parsing flow and replace the
raw JSON preview with a table-based viewer built with `shadcn/ui`.

### Planned Steps

1. Keep the existing dataset loading and parsing flow unchanged.
   - reuse the bundled dataset adapter
   - reuse the active dataset hook
   - keep normalization in the domain layer
2. Add `shadcn/ui` as the UI foundation for the viewer.
   - initialize `shadcn/ui` for the Vite app
   - add the minimum components needed for this task
   - expected primitives: `table`, `scroll-area`, `card`, `badge`, `button`, and `separator`
3. Add row-selection state to the application-facing hook.
   - extend the active dataset hook with `activeRowId`, `activeRow`, and `selectRow`
   - reset row selection when the active dataset changes
   - default to the first row when a dataset loads successfully
4. Add a presenter layer for display formatting.
   - prepare display fields for time, delta, method, message, and payload preview
   - keep truncation and formatting out of JSX
5. Replace the raw JSON preview with a table view.
   - render rows in source order
   - show columns for time, delta, method, message, and payload preview
   - highlight the selected row
6. Add a row-details panel beside or below the table.
   - show the full row fields
   - show full payload or raw row JSON in a readable code block
7. Update styling and layout using `shadcn/ui` conventions.
   - keep the bundled file list
   - make the table the primary viewer
   - preserve good readability on narrow screens with horizontal scroll where needed
8. Verify acceptance criteria.
   - bundled file selection still works
   - the selected dataset renders as a readable table
   - payload preview is truncated in the table
   - clicking a row reveals fuller details

### Suggested File Changes

```text
src/
  ui/
    components/
      dataset-table.tsx
      row-details.tsx
    presenters/
      present-log-row.ts
      present-row-details.ts
    hooks/
      use-active-bundled-dataset.ts
  components/
    ui/
      ...shadcn-generated components
  lib/
    utils.ts
  App.tsx
  App.css or app-level layout styles
  index.css
```

### Notes For Implementation

- Prefer `shadcn/ui` table primitives and composition instead of introducing a
  data-grid dependency at this stage.
- Keep `shadcn/ui` code generated into the app and wrapped by local
  log-viewer-specific components where composition starts repeating.
- Because `shadcn/ui` is Tailwind-based, this task implicitly introduces
  Tailwind setup work for the repo.
