---
description: Vitest and React Testing Library patterns, service and component test standards, coverage configuration
inclusion: auto
---

# Testing Standards

## Framework

- Vitest for unit tests, React Testing Library for component tests.
- Tests live in `__tests__/` folders co-located with source files.

## Service Tests

- Mock dependencies by creating partial `AwilixRegistry` objects.
- Use `vi.clearAllMocks()` in `beforeEach`.
- Test both success and error paths.
- Verify correct API path and payload in `expect(mockHttp.post).toHaveBeenCalledWith(...)`.

## Component Tests

- Use `getByRole` and `getByText` over `getByTestId` when possible.
- Test all variants and prop combinations.
- Include snapshot tests for visual regression.
- Verify event handlers are called with correct arguments.

## Mutation Tests

- Type all three generics of `UseMutationResult<Response, Error, Variables>`.
- Verify `toggleLoading()` is called in `mutationFn`, `onSuccess`, and `onError`.
- Test error code mapping and popup error display.

## Coverage

- Minimum coverage threshold: **85%** for branches, functions, lines, and statements.
- V8 provider with `text`, `json`, `html`, `lcov`, `cobertura` reporters.
- Excluded: protocols, routes, infrastructure, translations, assets.
- Run via `make unit-test-coverage` or `npm run test:coverage`.
- All new code must meet or exceed the 85% threshold before merging.
