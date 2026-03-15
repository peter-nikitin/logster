# Task 01: Bundled Files And Parsed Preview

## Product Increment

When I open the app, I see a list of hardcoded example files. When I click one, I see its parsed domain model on the page. Rendering it with `JSON.stringify` is acceptable for this task.

## Demo Result

Open the app and verify:

- a list of bundled files is visible
- clicking a file loads it
- parsed dataset output appears on screen

## Goal

Prove that the app can load example files, parse them into the domain model, and display the result.

## Scope

- hardcode the available example files from `data/examples`
- add a simple file picker UI for those bundled files
- parse the selected file into the normalized dataset shape
- render the parsed result as formatted JSON
- show a basic error state if parsing fails

## Included Technical Work

- dataset types
- parser
- normalization of rows
- basic active-dataset state

## Out Of Scope

- table layout
- custom file upload
- browser persistence
- advanced styling

## Acceptance Criteria

- the app shows bundled file names on first load
- clicking a bundled file activates it
- parsed rows are normalized with fields such as `timestamp`, `method`, `message`, and `deltaMs`
- the parsed result is visible in the UI, even if the presentation is raw JSON
- invalid bundled data produces a readable error state instead of a crash

## Notes

- this task is intentionally rough in presentation quality
- the important result is visible parsing, not polished analysis
