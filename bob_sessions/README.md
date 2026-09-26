# bob_sessions/

This directory stores screenshots and session logs from IBM Bob agent runs,
captured during the hackathon demo to prove that Bob's capabilities were used.

## What goes here

Each analysis run should be documented with:

| File | Content |
|---|---|
| `session-XX-structure.png` | Screenshot of Bob reading file structure |
| `session-XX-deps.png` | Screenshot of Bob scanning dependencies |
| `session-XX-bugs.png` | Screenshot of Bob detecting bugs/risks |
| `session-XX-tests.png` | Screenshot of Bob generating test stubs |
| `session-XX-report.png` | Screenshot of the final rendered report |

## Why this matters

The IBM Bob 2.0 Hackathon requires demonstrating that IBM Bob's agent
capabilities are central to the application ÔÇö not just a chatbot wrapper.
These screenshots document:

- Bob's `glob` and `grep` tools being used for analysis
- Bob's `read_file` and `FindSymbol` tools reading real code
- Bob's `spawn_subagent` running parallel analysis phases
- Bob's code generation producing real test stubs

## Format

Name files as: `session-[run-number]-[phase].png`
Example: `session-01-structure.png`, `session-01-bugs.png`
