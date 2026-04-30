---
inclusion: fileMatch
fileMatchPattern: ['**/*.ts', '**/*.tsx']
---

# No `any` Type Policy

## Rule

Never use `any` in TypeScript code. This applies to all architectural layers: protocols, domain, services, controllers, infrastructure, and presentation.

## Rationale

The project uses `strict: true` in `tsconfig.app.json`. Using `any` defeats the purpose of TypeScript's type system and bypasses compile-time safety checks. Every value must have an explicit, meaningful type.

## What to Use Instead

| Situation | Use |
|-----------|-----|
| Unknown value at compile time | `unknown` (then narrow with type guards) |
| Multiple possible types | Union types (`string \| number`) or generics (`<T>`) |
| Object with dynamic keys | `Record<string, SomeType>` or index signatures |
| Third-party lib without types | Declare a local type or use `unknown` with assertion |
| Function accepting anything | Generic parameter `<T>` with constraints where possible |
| Event handlers / callbacks | Typed event interfaces (e.g., `React.ChangeEvent<HTMLInputElement>`) |
| Error in catch blocks | `unknown`, then narrow with `instanceof` or type guard |
| JSON parse results | `unknown`, then validate with Zod schema |

## Layer-Specific Guidance

- **Protocols / Interfaces** — All method signatures must have fully typed parameters and return types. No `any` in generics.
- **Domain / Entities** — Model properties must use precise types. Use branded types or enums where applicable.
- **Services** — Input and output types must be explicit. Use Zod schemas for runtime validation of external data.
- **Controllers** — Typed request/response objects. No `any` in hook return types.
- **Infrastructure (DI, storage, NFC)** — Use generics with constraints for adapters. Repository interfaces must be fully typed.
- **Presentation (components, pages)** — Props interfaces required. No `any` in state, context, or event handlers.

## ESLint Alignment

The project currently has `@typescript-eslint/no-explicit-any: 'off'` in `eslint.config.js`. When generating or modifying code, still avoid `any` regardless of this setting. The intent is to migrate toward enabling this rule as `'error'`.

## Examples

```typescript
// ❌ Bad
function parse(data: any): any { ... }
const result: any = await fetch(url);

// ✅ Good
function parse(data: unknown): ParsedResult { ... }
const result: unknown = await response.json();
const validated = schema.parse(result);
```
