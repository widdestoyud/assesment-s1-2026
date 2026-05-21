---
inclusion: fileMatch
fileMatchPattern: "src/**/*.ts"
---

# No Unnecessary Type Assertions

## Rule

Never use `as` type assertions when the receiver already accepts the original type. If a function returns a specific union type, consumers should use it directly without casting.

## Why

SonarCloud flags unnecessary assertions as code smells. They add noise, hide potential type errors, and make refactoring harder.

## Bad (unnecessary assertion)

```typescript
// ❌ getErrorTitleKey returns a known union — assertion is redundant
title: t(getErrorTitleKey(chipOp.error) as 'mbc_nfc_error_title')
```

## Good (use return type directly)

```typescript
// ✅ Return type is already compatible with t()
title: t(getErrorTitleKey(chipOp.error))
```

## How to Fix

1. **Make the helper return a specific union type** instead of `string`:

```typescript
// ✅ Return type is a literal union — no assertion needed at call site
export type ErrorTitleKey = 'mbc_nfc_error_card_invalid_title' | 'mbc_nfc_error_title';

export const getErrorTitleKey = (errorKey: string | null): ErrorTitleKey => {
  if (errorKey && CARD_INVALID_ERROR_KEYS.has(errorKey)) {
    return 'mbc_nfc_error_card_invalid_title';
  }
  return 'mbc_nfc_error_title';
};
```

2. **If `t()` requires a specific key type**, narrow the helper's return type to match — don't cast at the call site.

## When `as` IS Acceptable

| Scenario | Allowed |
|----------|---------|
| Narrowing `unknown` after validation (e.g., Zod parse) | ✅ |
| Casting event targets (`e.target as HTMLInputElement`) | ✅ |
| Third-party lib with incomplete types | ✅ (with comment) |
| Return type already matches receiver | ❌ Never |
| Silencing a type error without fixing root cause | ❌ Never |

## Summary

- Prefer **narrowing return types** at the source over **asserting at the consumer**.
- If you find yourself writing `as SomeType` on a function call, ask: "Can I make the function return `SomeType` directly?"
- The goal: zero `as` assertions in business logic. Reserve `as` for genuine type narrowing scenarios.
