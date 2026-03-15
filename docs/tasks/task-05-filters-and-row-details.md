# Task 05: Filters And Row Details

## Product Increment

When I have a loaded dataset, I can progressively narrow it down and inspect one row with a payload viewer that is actually usable for nested JSON.

## Demo Result

Open the app and verify:

- I can see the list of methods that exist in the loaded log
- I can filter rows by method using a cascade-style workflow
- I can further narrow the result by matching inner log text
- I can exclude methods, show only specific methods, or mark methods for attention
- selecting a row shows a structured payload viewer with collapsible JSON fields

## Goal

Make the viewer practical for log investigation, not only for browsing a flat table.

## Scope

- method discovery from the active dataset
- cascade-style filtering UI
- method filter modes: exclude, show only, mark
- text filtering against visible log content
- optional filtering against nested payload text when useful
- improved row details panel
- collapsible JSON payload viewer

## Out Of Scope

- advanced query languages
- server-side filtering
- saved filter presets
- editing payload content

## Functional Requirements

### 1. Method List

- when a dataset is loaded, the UI should show the distinct methods present in that dataset
- each method entry should include enough context to be useful during investigation
- at minimum, show:
  - method name
  - row count for that method
- method discovery must update when the active dataset changes

### 2. Cascade Filtering UI

The filtering UI should feel like a narrowing flow instead of one flat list of controls.

Expected flow:

1. Start from all rows in the active dataset.
2. Narrow by method selection.
3. Narrow further by free-text matching.
4. Keep the result visible in the table immediately.

The user should be able to work in this order:

- mark rows by method first
- then refine by inner log text
- or start with text and still see method-level controls react correctly

The UI does not need to mimic a database query builder, but it should clearly communicate that filters stack on top of each other.

### 3. Method Filter Modes

Method filtering should support three investigation actions:

- `show only`
  - keep only rows whose method is in the selected set
- `exclude`
  - hide rows whose method is in the selected set
- `mark`
  - visually highlight rows whose method is in the selected set without removing other rows

Rules:

- `show only` and `exclude` affect the visible dataset
- `mark` is non-destructive and should not remove rows
- the active mode should be explicit in the UI
- the user should be able to switch modes without losing context unnecessarily

### 4. Text Filtering

- support free-text filtering for visible log content
- text filtering should be fast enough for normal in-browser datasets
- matching should cover:
  - message text
  - method text when relevant
  - nested payload text if this remains practical for performance

Notes:

- this task should prioritize investigative usefulness over minimal implementation
- if payload text filtering is expensive, document and implement a clear boundary instead of shipping vague behavior

### 5. Row Details And Payload Viewer

- selecting a row should open a detail area that makes nested payload data readable
- the payload field should not be rendered only as a flat string preview
- add a JSON viewer for payload data with collapsible object and array nodes
- nested fields must be expandable and collapsible independently
- the details panel should still allow access to the raw row data when needed

Preferred detail structure:

- summary metadata for the selected row
- formatted payload viewer
- raw row / raw JSON fallback

## Acceptance Criteria

- the active dataset shows a distinct method list derived from its rows
- the user can apply method filtering in `show only` mode
- the user can apply method filtering in `exclude` mode
- the user can apply method marking in `mark` mode without hiding rows
- stacked filters update the visible table rows immediately
- free-text filtering narrows rows by log content
- the filtering UI communicates that method and text filters are combined
- selecting a row opens a details view with a structured payload viewer
- nested payload objects and arrays can be collapsed and expanded
- raw row data remains accessible for debugging or copy/paste

## Notes

- this task should make filtering feel like an investigation workflow, not a generic search box plus checkbox list
- method marking is important because sometimes the user wants emphasis, not exclusion
- the payload viewer should handle large nested JSON more gracefully than a plain `pre` block

## Suggested Implementation Direction

### Filtering Model

- compute distinct methods from the active dataset
- keep filter state separate from parsing and storage concerns
- derive a filtered row list for the table instead of mutating the dataset itself
- keep marking state available to both the table and the method list

### UI Areas

Suggested additions to the current workspace:

- filter toolbar or filter side panel for:
  - method list
  - filter mode switch
  - text input
- table row highlighting for marked methods
- enhanced row details panel for payload inspection

### Payload Viewer

Implementation options:

1. lightweight custom tree viewer for JSON values
2. small focused JSON viewer dependency if it fits the codebase cleanly

Preference:

- use the smallest option that gives reliable collapse and expand behavior
- avoid shipping a heavy inspector if a simple tree viewer is enough

## Testing Expectations

- method list generation from loaded rows
- filtering behavior for `show only`, `exclude`, and `mark`
- stacked method and text filters
- row highlighting when methods are marked
- row details rendering for nested payload data
- collapse and expand behavior in the JSON viewer

## Done Definition

This task is done when:

- the user can see which methods exist in the current log
- the user can narrow the table through cascade-style method and text filters
- the user can exclude, isolate, or mark methods depending on the investigation need
- the selected row opens into a payload viewer with collapsible nested JSON
- the experience feels purpose-built for log analysis rather than generic table browsing
