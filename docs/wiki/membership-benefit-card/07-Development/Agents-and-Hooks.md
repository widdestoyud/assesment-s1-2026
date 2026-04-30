# Agents and Hooks

> Covers: Development workflow automation

## Overview

The project uses Kiro agents and hooks for workflow automation — product analysis, quality assurance, and documentation generation.

## Agents

| Agent | Trigger | Function |
|-------|---------|----------|
| **@product-owner** | Auto on business/feature keywords | PO analysis: acceptance criteria, edge cases, impact |
| **@qa-tester** | Manual via chat or auto via hooks | Run tests, check coverage, validate specs |
| **@wiki-documenter** | Manual via chat | Generate/update wiki documentation |

## Hooks

| Hook | Event | Action |
|------|-------|--------|
| Product Owner Review | `promptSubmit` | Auto PO analysis for business requests |
| QA: Run Tests After Task | `postTaskExecution` | Auto run vitest after task completion |
| QA: Run Edited Test File | `fileEdited (*.test.*)` | Auto run the edited test file |
| QA: Check Test Coverage | `fileEdited (source files)` | Check if tests exist for the changed file |
| QA: Test Reminder | `fileCreated (MBC source)` | Reminder to create test file for new source |
| QA: Full Coverage Report | `userTriggered` | Full test suite + coverage analysis |
| QA: Validate Specs vs Tests | `userTriggered` | Map 22 requirements to test coverage |

## Wiki Documenter Workflow

The wiki documenter agent (this documentation):
1. Reads spec files: `requirements.md`, `design.md`, `tasks.md`
2. Reads source code for actual implementation details
3. Reads steering files for architecture conventions
4. Generates all pages in `docs/wiki/`
5. Re-runnable — always overwrites with fresh content from current specs

## Related Pages

- [Getting Started](Getting-Started) — Setup and commands
- [Git Flow](Git-Flow) — Branch strategy and PR process
- [Testing Strategy](../06-Testing/Testing-Strategy) — QA approach
