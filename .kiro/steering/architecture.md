---
description: Clean Architecture layer separation, Awilix DI, controller pattern, service and protocol rules
inclusion: auto
---

# Clean Architecture Standards

This project follows Clean Architecture with strict layer separation. All code changes must respect these boundaries.

## Layer Hierarchy (dependencies flow inward only)

```
Presentation → Controllers → Core (@core) → Infrastructure
```

- **Core (`@core/`)**: Protocols (interfaces), services, use cases. Framework-agnostic — no React, no Axios, no browser APIs.
- **Infrastructure**: DI container (Awilix), HTTP adapter, storage adapter, config. Implements core protocols.
- **Controllers**: Pure factory functions receiving all dependencies via DI. Contain business logic, state orchestration, form validation.
- **Presentation**: Pages and components. Pages are thin — resolve a controller from DI and render UI. Zero business logic.

## Dependency Injection (Awilix)

- All runtime dependencies flow through `AwilixRegistry`.
- Use `asFunction` for services, controllers, use cases. Chain `.singleton()` when needed.
- Use `asValue` for libraries, hooks, config objects.
- Each registry file exports a register function and a corresponding interface.
- The `AwilixRegistry` type merges all container interfaces.

## Controller Rules

- Controllers use **only `import type`** statements. Every runtime value comes from `AwilixRegistry` destructuring.
- Export the controller as `default`, its interface as a named export.
- Return interface must be minimal — only what the view needs.
- Handle loading and error states inside the controller.

## Service Rules

- Services depend only on `http` (and optionally `config`) from the registry.
- Type all generic parameters: `http.post<Response, Request, Config>`.
- Define request/response interfaces in the same service file.
- Use `HttpResponse<T>` wrapper for consistent typing.

## Protocol Rules

- Protocols live in `@core/protocols/` and must be framework-agnostic.
- Infrastructure adapters implement these interfaces.
- Never import Axios, localStorage, or browser APIs directly in `@core/`.

## Presentation Rules

- Pages resolve controllers via `awilix.resolve<Interface>('controllerName')`.
- Components extend native HTML element attributes and spread `...otherProps`.
- Use `FC<Props>` for all functional components.
- Use `data-testid` for test selectors, `loading="lazy"` on images.
- Components that don't use DI may import React hooks directly.

## TanStack Query & Storage Persister

- Use `PersistQueryClientProvider` (from `@tanstack/react-query-persist-client`) instead of plain `QueryClientProvider`.
- Create the persister with `createAsyncStoragePersister` using `webStorageAdapter` (the `LocalStorageProtocol` implementation).
- Persister key must be namespaced per project (e.g., `MyTelkomselPrepaidRegistrationStorage`).
- Use `buster` option tied to `config.basicVersion` to invalidate cache on app version changes.
- Default `gcTime` and `staleTime` are set globally via environment config — use cases may override with explicit values.
- The persister serializes the entire query cache to localStorage, enabling offline-first data access.
