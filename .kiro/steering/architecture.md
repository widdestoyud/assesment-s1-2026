---
description: Clean Architecture 5-layer separation, Awilix DI, controller pattern, service and protocol rules
inclusion: auto
---

# Clean Architecture Standards

This project follows Clean Architecture with **5 layers**. Dependencies flow inward only. All code changes must respect these boundaries.

## 5-Layer Architecture

```
┌─────────────────────────────────────────────┐
│  Layer 5: Presentation                      │
│  Pages (thin views) + Components (UI only)  │
├─────────────────────────────────────────────┤
│  Layer 4: Controllers                       │
│  State orchestration, validation, expose t  │
├─────────────────────────────────────────────┤
│  Layer 3: Use Cases                         │
│  Business orchestration across services     │
├─────────────────────────────────────────────┤
│  Layer 2: Services                          │
│  Pure logic + adapters (NFC, storage, etc.) │
├─────────────────────────────────────────────┤
│  Layer 1: Core                              │
│  Protocols (interfaces) + Domain models     │
└─────────────────────────────────────────────┘
         ↕ Infrastructure (DI, config, adapters)
```

### Layer 1: Core — Protocols & Domain Models

- **Location**: `src/@core/protocols/`, `src/@core/services/mbc/models.ts`
- Protocols (interfaces) define contracts — framework-agnostic, no implementation.
- Domain models: entities, types, Zod schemas, constants.
- No React, no Axios, no browser APIs. Zero runtime dependencies.

### Layer 2: Services — Pure Logic & Adapters

- **Location**: `src/@core/services/`, `src/infrastructure/`
- Pure services: pricing engine, card-data serialization, silent-shield encryption.
- Adapter services: NFC, storage, device binding — implement core protocols.
- Services depend only on protocols and other services, never on use cases or controllers.

### Layer 3: Use Cases — Business Orchestration

- **Location**: `src/@core/use_case/mbc/`
- Orchestrate multi-service flows: CheckIn, CheckOut, TopUp, Register, ReadCard, ManualCalculation.
- Each use case calls multiple services in sequence (e.g., CheckOut: NFC read → pricing → card-data → NFC write → verify).
- Use cases depend on services and protocols, never on controllers or presentation.

### Layer 4: Controllers — State & DI Bridge

- **Location**: `src/controllers/mbc/`
- Pure factory functions receiving all dependencies via Awilix DI.
- Orchestrate React state, call use cases, handle loading/error states.
- Expose `t: TFunction` from i18n (injected via `useTranslation` from DI).
- Export the controller as `default`, its interface as a named export.
- Controllers use **only `import type`** statements. Every runtime value comes from `AwilixRegistry` destructuring.
- Return interface must be minimal — only what the view needs.

### Layer 5: Presentation — Pages & Components

- **Location**: `src/presentation/pages/`, `src/presentation/components/`
- Pages are thin: resolve a controller from DI, destructure `t` from controller, render UI.
- Components receive `t: TFunction` as a prop — never call `useTranslation()` directly.
- Zero business logic in presentation. All logic lives in controllers or use cases.
- Use `FC<Props>` for all functional components.
- Use `data-testid` for test selectors.

### Infrastructure — Cross-cutting

- **Location**: `src/infrastructure/`
- DI container (Awilix), HTTP adapter, storage adapter, config.
- Implements core protocols from Layer 1.
- Not a layer in the dependency chain — it wires everything together.

## Dependency Rules

```
Presentation → Controllers → Use Cases → Services → Core
                                            ↑
                                      Infrastructure
```

- Each layer may only depend on layers below it (inward).
- Never import upward: a service must not import a controller, a use case must not import presentation.
- Infrastructure implements Core protocols and is injected via DI — it sits outside the main chain.

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
- Inject `useTranslation` via deps, expose `t: TFunction` in return interface.

## Service Rules

- Services depend only on protocols (and optionally `config`) from the registry.
- Type all generic parameters: `http.post<Response, Request, Config>`.
- Define request/response interfaces in the same service file.
- Use `HttpResponse<T>` wrapper for consistent typing.

## Protocol Rules

- Protocols live in `@core/protocols/` and must be framework-agnostic.
- Infrastructure adapters implement these interfaces.
- Never import Axios, localStorage, or browser APIs directly in `@core/`.

## Presentation Rules

- Pages resolve controllers via `awilix.resolve<Interface>('controllerName')`.
- Pages get `t` from `ctrl.t`, pass `t` as prop to child components.
- Components receive `t: TFunction` as a prop — never import `useTranslation` directly.
- Components extend native HTML element attributes and spread `...otherProps`.
- Use `FC<Props>` for all functional components.
- Use `data-testid` for test selectors, `loading="lazy"` on images.

## TanStack Query & Storage Persister

- Use `PersistQueryClientProvider` (from `@tanstack/react-query-persist-client`) instead of plain `QueryClientProvider`.
- Create the persister with `createAsyncStoragePersister` using `webStorageAdapter` (the `LocalStorageProtocol` implementation).
- Persister key must be namespaced per project (e.g., `MyTelkomselPrepaidRegistrationStorage`).
- Use `buster` option tied to `config.basicVersion` to invalidate cache on app version changes.
- Default `gcTime` and `staleTime` are set globally via environment config — use cases may override with explicit values.
- The persister serializes the entire query cache to localStorage, enabling offline-first data access.
