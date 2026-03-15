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
