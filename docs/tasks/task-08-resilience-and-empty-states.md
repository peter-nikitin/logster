# Task 08: Resilience And Empty States

## Product Increment

When something fails or no data is loaded yet, the app still tells me what to do next.

## Demo Result

Open the app and verify:

- first visit without data has a useful empty state
- invalid files show a clear error
- storage failures do not break the app

## Goal

Make the product reliable enough for everyday use.

## Scope

- first-visit empty state
- malformed JSON errors
- invalid row-shape errors
- storage quota and restore errors

## Acceptance Criteria

- the app never crashes on malformed input
- empty states guide the user to the next action
- recovery from storage or restore errors is possible

## Notes

- this task should make failure paths feel intentional instead of incidental
- the user should always see either useful data, a recovery path, or both
- resilience work should not regress the current bundled and stored dataset flows

## Implementation Plan

This task should formalize the workspace states around `useActiveDataset` so the
screen can distinguish between `empty`, `error`, `loading`, and `ready`
scenarios instead of only toggling between a table and a generic error banner.

### Planned Steps

1. Define the workspace states and the user-facing copy for each case.
   - first visit with no active dataset selected
   - import failure caused by malformed JSON
   - import failure caused by invalid row shape
   - restore or storage failures that still leave bundled datasets usable
2. Stop auto-opening a bundled dataset on first visit.
   - change the initial selection flow so the app can render a true first-run empty state
   - keep bundled files visible and selectable from the sidebar
   - preserve explicit dataset selection once the user opens one
3. Extend the active-dataset hook to return structured status information.
   - separate parse/import errors from restore and persistence errors
   - keep recoverable storage failures from clearing already-available bundled content
   - expose enough state for the screen to choose the correct empty or error component
4. Split the current generic feedback UI into dedicated states.
   - add an empty workspace state with a clear next action
   - update the existing error component so titles and actions match the failure type
   - ensure storage warnings can appear without blocking dataset selection
5. Harden the import and restore flows against repository failures.
   - handle quota failures while saving uploaded datasets
   - handle restore failures without breaking bundled dataset access
   - handle missing or corrupted stored entries with a recoverable message
6. Update the app shell layout to render the right state in the content area.
   - show the empty state when no dataset is active and no blocking error exists
   - keep the dataset table visible when a non-fatal storage warning occurs
   - avoid rendering an empty card or dead-end screen
7. Add focused tests for resilience behavior.
   - parser tests for malformed JSON and invalid row shapes
   - hook or use-case tests for restore, save, and delete failure handling
   - UI tests for first-run empty state and error-state messaging
8. Verify the task against the demo result.
   - first visit shows guidance instead of auto-loaded content
   - invalid files produce a clear, non-crashing error
   - storage failures still allow the user to continue with bundled files

### Suggested File Changes

```text
docs/tasks/
  task-08-resilience-and-empty-states.md
src/
  App.tsx
  app/use-cases/
    load-uploaded-dataset.ts
    restore-stored-datasets.ts
    save-uploaded-dataset.ts
  adapters/storage/
    __tests__/
    indexeddb-dataset-repository.ts
  domain/log-dataset/services/
    __tests__/
    parse-log-dataset.test.ts
  ui/components/
    empty-state.tsx
    error-state.tsx
    dataset-source-panel.tsx
  ui/hooks/
    use-active-dataset.ts
  ui/presenters/
    ...if state-specific copy needs presentation helpers
  ui/test-ids.ts
```

### Notes For Implementation

- Treat restore and persistence problems as non-fatal whenever bundled datasets
  can still be opened.
- Keep error messages specific enough that the user can tell whether the file is
  malformed, the row shape is unsupported, or browser storage failed.
- Prefer small, explicit UI states over a single component with many optional
  branches.
