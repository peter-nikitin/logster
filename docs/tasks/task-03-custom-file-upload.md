# Task 03: Custom File Upload

## Product Increment

When I have my own log file, I can upload it and view it in the same table as the bundled examples.

## Demo Result

Open the app and verify:

- an upload control is available
- selecting a local JSON file imports it
- the uploaded file becomes the active dataset in the viewer

## Goal

Extend the viewer from demo data to real user data.

## Scope

- add a local JSON file input
- read the file in the browser
- parse it with the same domain parser as bundled files
- activate the uploaded dataset in the UI
- show import errors cleanly

## Out Of Scope

- browser persistence across reloads
- multiple uploaded dataset management

## Acceptance Criteria

- the user can upload a valid `.json` file
- the uploaded file appears in the viewer without a page reload
- uploaded files use the same normalized domain model as bundled files
- invalid uploads do not crash the app
- the UI clearly indicates which dataset is active

## Notes

- this is the first increment that supports real user logs
- uploaded datasets can remain in memory only for this task
