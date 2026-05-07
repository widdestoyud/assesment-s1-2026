---
description: Agent shorthand aliases for faster invocation
inclusion: auto
---

# Agent Aliases

When the user uses these shorthand aliases in their message, treat them as references to the corresponding agent and invoke/apply the agent's behavior accordingly:

| Alias | Agent | Action |
|-------|-------|--------|
| `@PO` | product-owner | Read `.kiro/agents/product-owner.prompt.md` and apply PO analysis |
| `@git` | git-flow | Read `.kiro/agents/git-flow.prompt.md` and execute git operations |
| `@SA` | Software Architect | Read `.kiro/agents/software-architect.prompt.md` and apply architecture design |
| `@dev` | developer | Apply developer coding standards and implementation |
| `@sonar` | sonar-fixer | Invoke sonar-fixer sub-agent for code quality fixes |
| `@qa` | qa-tester | Read `.kiro/agents/qa-tester.prompt.md` and apply QA analysis |
| `@wiki` | spec-documenter | Invoke spec-documenter sub-agent for wiki generation |

## Rules

- Aliases are case-insensitive: `@po`, `@PO`, `@Po` all map to product-owner.
- If the user writes `@SA rancang fitur X`, invoke the Software Architect behavior for that request.
- If the user writes `@git commit`, apply git-flow instructions.
- Multiple aliases in one message are allowed: `@PO @SA review arsitektur ini`.
- The alias must appear at the start of the message or after a space/newline to be recognized.
