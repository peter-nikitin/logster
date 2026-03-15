# Logster Spec

## Purpose

Logster is a local log viewer for JSON log files stored in `data/examples` and similar folders. Its goal is to let a user inspect large logs without reading raw JSON manually.

The product is optimized for log rows shaped like:

```json
[timestamp, "[method-name]", message, optionalPayload]
```

Example:

```json
[1773332304255, "[use-tab-content]", "attempt to update...", { "foo": "bar" }]
```

## Problem

The current logs are readable by machines but inefficient for humans. Raw JSON makes it hard to:

- scan events in order
- isolate a specific method
- see delays between events
- inspect payloads without losing context

## Users

Primary user:

- a developer or analyst investigating browser/app behavior from exported JSON logs

## Core Job Stories

When I have a log file, I want:

- to read it in a table view with filters
- to see time spans between log rows
- to filter rows by method name written in square brackets
- to upload it once and keep it available in browser storage without using a server

## Goals

- Make one log file easy to inspect in under 30 seconds.
- Reduce the need to open raw JSON directly.
- Surface timing gaps and repeated method activity quickly.
- Keep uploaded log data available between browser sessions on the same device.

## Non-Goals For MVP

- server-side storage
- real-time log streaming
- multi-user collaboration
- advanced query language
- editing or mutating log files

## Main Path

The main user flow for MVP should be:

1. Open the app.
2. Upload a JSON log file from disk.
3. The app validates and normalizes the file.
4. The normalized dataset and file metadata are stored in browser storage.
5. On the next visit, the app restores previously stored datasets automatically.
6. The user opens a stored dataset and continues analysis without re-uploading.

This persistence is local-only. No server is involved.

## Supported Input

MVP supports JSON files containing an array of rows.

Each row is expected to be:

1. `timestamp: number`
2. `method: string`
3. `message: string`
4. `payload?: unknown`

Assumptions:

- `timestamp` is in milliseconds
- `method` includes square brackets, for example `[use-tab-content]`
- rows are already ordered, but the app should tolerate minor inconsistencies
- file sizes must fit practical browser-storage limits

## Normalized Row Model

The UI should normalize raw rows into a stable internal shape:

```ts
type LogRow = {
  id: string
  timestamp: number
  formattedTime: string
  deltaMs: number | null
  method: string
  message: string
  payload?: unknown
  raw: unknown[]
}
```

Notes:

- `deltaMs` is the difference from the previous visible row in source order
- the first row has `deltaMs = null`
- `raw` preserves the original input for debugging and export

## MVP Features

### 1. File Loading

The app must let the user open a log source by:

- uploading a local JSON file
- selecting one of the bundled example files for development/demo use
- reopening a previously stored dataset from browser storage

The upload-and-store flow is part of the main path.

### 2. Local Storage Persistence

The app must persist uploaded datasets in browser storage so the user does not need to upload the same file every time.

Requirements:

- no server or remote sync
- data survives page reloads and browser restarts
- stored items include a human-readable name and import timestamp
- the user can remove stored datasets
- the app restores the last used dataset when possible

Suggested stored metadata:

- dataset id
- original file name
- imported at
- row count
- first timestamp
- last timestamp
- optional file fingerprint or hash

Storage guidance:

- prefer IndexedDB over `localStorage` because log payloads can be large
- keep the storage layer abstract so persistence details stay outside the UI
- show a readable error if browser storage quota is exceeded

### 3. Table View

The main view must render one row per log entry with these columns:

- time
- delta
- method
- message
- payload preview

Behavior:

- rows are displayed in chronological/source order
- the table is scrollable
- long payloads are truncated in the table
- selecting a row reveals full details

### 4. Filters

The app must support:

- method filter
- free-text search on message text
- optional filter for rows that include payload

Method filter requirements:

- values are derived from the loaded file
- each method shows a count of matching rows
- filtering by method name like `[use-tab-content]` must be fast and obvious

### 5. Time Span Analysis

The app must compute time deltas between consecutive rows.

Requirements:

- show delta in milliseconds in a dedicated column
- visually highlight large gaps
- support quick identification of the biggest delays in the session

Suggested thresholds:

- warning: `> 100 ms`
- high: `> 500 ms`
- critical: `> 1000 ms`

Threshold values can be adjusted later.

### 6. Row Details

Selecting a row must show:

- full timestamp
- method
- full message
- formatted JSON payload
- original raw row

The details panel can appear in a side pane or bottom drawer.

### 7. Summary Metrics

The app should show small summary stats near the top:

- total rows
- unique methods
- first timestamp
- last timestamp
- biggest delta

## UX Requirements

The interface should be optimized for dense diagnostic work.

Recommended layout:

- top bar with upload action, stored dataset selector, and summary stats
- left sidebar with method filters
- central table for rows
- right or bottom details panel for selected row

UX principles:

- keep filters visible while scrolling
- make method names easy to scan with monospace styling
- emphasize timing anomalies without overwhelming normal rows
- preserve context when opening row details

## Error Handling

The app must handle invalid input gracefully.

Cases to cover:

- malformed JSON
- rows that do not match the expected array shape
- missing timestamp or method
- empty files
- storage quota exceeded
- stored dataset cannot be restored

Error state should explain:

- what failed
- which file failed
- what row shape is expected

## Technical Notes

Frontend stack:

- React
- TypeScript
- Vite

Implementation guidance:

- keep parsing logic separate from presentation
- keep persistence logic separate from parsing and presentation
- derive filter values from normalized data
- avoid heavy dependencies for the first version
- design the data layer so storage, upload, and future file comparison can reuse the same normalized model

## Proposed Milestones

### Milestone 1: Single-File Viewer

- upload one local file
- normalize rows
- store the dataset in browser storage
- restore it on reload
- render the table
- show row details

### Milestone 2: Filtering And Delta Analysis

- add method filter
- add text search
- add payload-only filter
- highlight time gaps

### Milestone 3: Better Navigation

- manage multiple stored datasets
- support multiple bundled files
- add summary metrics
- improve empty/error states

## Acceptance Criteria

The MVP is complete when:

- a user can upload a JSON log file
- the uploaded dataset is stored locally in the browser
- the dataset is restored after reload without another upload
- the file is shown as a readable table
- the user can filter rows by method name
- the user can see time deltas between rows
- the user can open a row and inspect its payload in formatted JSON
- malformed input produces a readable error state instead of a crash

## Future Enhancements

Potential next steps after MVP:

- compare two logs side by side
- group rows by method
- collapse repeated messages
- export filtered rows
- timeline or histogram view of timing gaps
- deep links to filters and selected row
