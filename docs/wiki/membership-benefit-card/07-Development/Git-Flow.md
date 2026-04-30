# Git Flow

> Covers: Development workflow

## Branch Strategy

The project follows a phase-based branching strategy aligned with the bottom-up build order:

```mermaid
gitgraph
    commit id: "main"
    branch "feat/mbc-layer-0"
    commit id: "Layer 0: Models"
    commit id: "Layer 0: Protocols"
    checkout main
    merge "feat/mbc-layer-0"
    branch "feat/mbc-layer-1"
    commit id: "Layer 1: pricing"
    commit id: "Layer 1: card-data"
    commit id: "Layer 1: silent-shield"
    checkout main
    merge "feat/mbc-layer-1"
    branch "feat/mbc-layer-2-3"
    commit id: "Layer 2: adapters"
    commit id: "Layer 3: services"
    commit id: "DI wiring"
    checkout main
    merge "feat/mbc-layer-2-3"
    branch "feat/mbc-layer-4"
    commit id: "Layer 4: use cases"
    checkout main
    merge "feat/mbc-layer-4"
    branch "feat/mbc-layer-5-6"
    commit id: "Layer 5: controllers"
    commit id: "Layer 6: UI"
    commit id: "PWA setup"
    checkout main
    merge "feat/mbc-layer-5-6"
```

## Commit Convention

Format: `type(scope): Subject in sentence case`

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `test` | Adding/updating tests |
| `refactor` | Code restructuring |
| `chore` | Build, config, tooling |

Examples:
```
feat(mbc): Add CardData and ServiceType models
test(mbc): Add property tests for pricing service
docs(mbc): Generate wiki documentation
```

Enforced via Husky `commit-msg` hook with commitlint.

## PR Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Ensure all tests pass (`npm run test`)
4. Ensure lint passes (auto-checked by pre-commit hook)
5. Push to remote with `-u` flag
6. Create PR via `gh pr create`
7. PR title: concise, under 70 characters
8. PR description: summary of changes, what was tested

## Related Pages

- [Phase Progress](Phase-Progress) — Current phase status
- [Getting Started](Getting-Started) — Setup and commands
