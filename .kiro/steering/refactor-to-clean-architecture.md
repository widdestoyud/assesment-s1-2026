---
description: Step-by-step guide to refactor a React project into Clean Architecture with Awilix DI and controller pattern
inclusion: manual
---

# Skill: Refactor to Clean Architecture

Refactor an existing React project to follow Clean Architecture with Awilix DI, controller pattern, and strict layer separation.

## When to Use

- Migrating a React project that has business logic in components.
- Introducing dependency injection to an existing codebase.
- Restructuring a flat project into layered architecture.

## Steps

### 1. Set Up Folder Structure

Create the target structure:

```
src/
├── @core/
│   ├── protocols/        # Interface contracts (HttpProtocol, LocalStorageProtocol, UseCaseProtocol)
│   ├── services/         # API service implementations
│   └── use_case/         # Application use cases
├── infrastructure/
│   ├── di/
│   │   ├── container.ts  # Root container + AwilixRegistry type
│   │   └── registry/     # Module registrations per domain
│   ├── http/             # HttpProtocol implementation (e.g., axiosAdapter)
│   ├── storage/          # LocalStorageProtocol implementation
│   └── config.ts         # Centralized env var access
├── controllers/          # Page controllers (factory functions)
├── presentation/
│   ├── components/       # Reusable UI components
│   └── pages/            # Page components grouped by feature domain
├── contexts/             # React Context definitions
├── routes/               # Router configuration
└── utils/
    ├── constants/        # Typed constant objects (as const)
    ├── helpers/          # Pure utility functions
    ├── hooks/            # Custom React hooks
    └── interceptors/     # HTTP interceptors
```

### 2. Define Protocols

Create framework-agnostic interfaces in `@core/protocols/`:

- `HttpProtocol` with typed `get`, `post`, `put`, `delete`, `patch` methods.
- `LocalStorageProtocol` with `getItem`, `setItem`, `removeItem`, `clear`.
- `UseCaseProtocol` with generic `useCase<T>()` method.

### 3. Set Up Awilix DI Container

- Create registry files per domain in `infrastructure/di/registry/`.
- Each registry exports a `register*Modules(container)` function and a corresponding interface.
- Merge all interfaces into `AwilixRegistry` type in `container.ts`.
- Use `asFunction` for services/controllers/use cases, `asValue` for libraries/hooks/config.

### 4. Extract Controllers from Components

For each page component with business logic:

1. Create a controller file: `controllers/[page-name].controller.ts`.
2. Define the return interface with only what the view needs.
3. Move all hooks, state, effects, mutations, form logic into the controller.
4. The controller is a factory function receiving `AwilixRegistry`.
5. Use only `import type` — all runtime values come from DI.
6. The page component becomes thin: resolve controller, render UI.

### 5. Extract Services

For each API call scattered in components/hooks:

1. Create a service file: `@core/services/[domain].service.ts`.
2. Define the service interface and response interfaces.
3. Implement as a factory function depending only on `http` from registry.
4. Type all generics: `http.post<Response, Request, Config>`.

### 6. Create Use Cases

For data fetching with caching:

1. Create use case files in `@core/use_case/`.
2. Implement `UseCaseProtocol` using TanStack Query.
3. Set explicit `gcTime` and `staleTime`.

### 7. Centralize Constants

- Move all magic strings to `utils/constants/` with `as const`.
- Export union types for type safety.
- Register in DI container.

### 8. Set Up Infrastructure Adapters

- Implement `HttpProtocol` with Axios (centralized error handling, interceptors).
- Implement `LocalStorageProtocol` wrapping `window.localStorage`.
- Create `config.ts` accessing all `VITE_*` env vars with fallbacks.

### 9. Wire Up Custom Hooks

- Wrap React Context access in focused hooks: `use-[feature].hook.ts`.
- Each hook exports a typed interface.
- Register hooks in DI via `helperContainer.ts`.

## Validation Checklist

- [ ] No runtime imports in controllers (only `import type`).
- [ ] No business logic in page components.
- [ ] No direct Axios/localStorage/browser API usage in `@core/`.
- [ ] All dependencies flow through `AwilixRegistry`.
- [ ] Protocols are framework-agnostic.
- [ ] Constants use `as const` with exported union types.
- [ ] Tests mock dependencies via partial `AwilixRegistry` objects.
