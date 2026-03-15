# Task 04: Browser Storage And Restore

## Product Increment

When I upload my own file, it stays available after reload because the app stores it in browser storage and restores it automatically.

## Demo Result

Open the app and verify:

- upload a file
- reload the page
- the dataset is still available and can be reopened without uploading again

## Goal

Deliver the core product promise: no need to load the same file every time.

## Scope

- persist uploaded datasets in browser storage
- restore stored dataset metadata on app startup
- restore the last active dataset when possible
- allow reopening stored datasets from the UI
- allow deleting stored datasets

## Storage Direction

- prefer IndexedDB over `localStorage`

## Out Of Scope

- cloud sync
- server storage
- file comparison

## Acceptance Criteria

- uploaded datasets survive page reloads
- stored datasets are visible in the app after restart
- the last active dataset is restored automatically when possible
- the user can delete stored datasets
- storage failures show a readable error state

## Notes

- after this task, the app supports the full main path for one-device local use
