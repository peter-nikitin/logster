# Next Job Stories Hypotheses

## Purpose

This document captures likely next-step user needs after the first MVP of the single-file log viewer is working.

These are hypotheses, not locked requirements. They help shape the next milestones and data model so the MVP does not block future analysis work.

## Hypothesis 1: Slowest Operations Analysis

Job story:

- When I have a file, I want to analyze which operation takes the most time.

### Why This Matters

The current delta-per-row view helps spot gaps, but it does not yet answer a higher-level question:

- which method or operation is consistently slow
- which single operation had the largest delay
- whether delays are isolated or repeated

### User Needs Behind This Story

The user likely wants to:

- rank slow operations
- understand where time is spent
- find outliers quickly
- move from raw row inspection to performance-oriented diagnosis

### Product Hypothesis

After MVP table filtering is working, the next valuable feature is an analysis layer that aggregates timing by operation.

Possible outputs:

- top N largest gaps
- slowest methods by max delta
- slowest methods by average delta
- count of delays above thresholds
- list of suspicious sequences around large gaps

### Open Questions

- Does "operation" mean a single method, or a start/end pair across multiple methods?
- Are delays meaningful only between adjacent rows, or should related rows be grouped into flows?
- Does the user need a ranking table, a chart, or both?

### Implications For MVP Design

To support this later without rework, the MVP should:

- preserve source order
- compute `deltaMs` cleanly
- store method names in normalized form
- make summary calculations easy to add

## Hypothesis 2: Compare Two Or More Files

Job story:

- When I have 2 or more files, I want to compare them.

### Why This Matters

Comparison is a natural next step when a user has:

- successful vs failed sessions
- before vs after changes
- slow vs fast runs
- logs from different environments

### User Needs Behind This Story

The user likely wants to compare:

- total duration
- row count
- methods present in one file but not another
- timing differences for the same method
- different sequences of events

### Product Hypothesis

The first useful comparison mode is not raw row-by-row diff. The better starting point is a higher-level comparison summary.

Recommended comparison outputs:

- file summary cards side by side
- method counts by file
- biggest timing differences by method
- methods missing from one file
- side-by-side filtered tables when drilling deeper

### Comparison Modes To Consider

Phase 1 comparison:

- compare file-level metrics
- compare method-level aggregates

Phase 2 comparison:

- compare selected methods across files
- inspect synchronized slices side by side

Phase 3 comparison:

- attempt sequence diffing or anomaly detection

### Open Questions

- Will users compare exactly two files most of the time, or an arbitrary set?
- Should comparison focus on counts, timings, sequence shape, or all three?
- Are files comparable only when they come from the same scenario?

### Implications For MVP Design

To support multi-file comparison later, the MVP should:

- store multiple datasets, not only one
- assign stable dataset ids and metadata
- keep normalized rows grouped by dataset
- separate file-level metrics from row rendering

## Suggested Priority After MVP

The likely sequence is:

1. Add stored dataset management.
2. Add slow-operation analysis for one file.
3. Add comparison view for two files.
4. Expand comparison to multiple files if the two-file case proves useful.

## Candidate Success Metrics

These hypotheses are useful if users can:

- identify the slowest method in a file within one minute
- compare two files without opening raw JSON manually
- explain why one session was slower or behaved differently
