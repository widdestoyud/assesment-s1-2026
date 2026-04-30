# Phase Progress

> Covers: All requirements (implementation tracking)

## Overview

The MBC feature is built in 6 phases following the bottom-up build order. Each phase corresponds to one or more architectural layers.

## Phase Summary

```mermaid
pie title Implementation Progress
    "Phase 1 — Layer 0 (Done)" : 5
    "Phase 2 — Layer 1 (In Progress)" : 3
    "Phase 3 — Layer 2-3 (Planned)" : 7
    "Phase 4 — Layer 4 (Planned)" : 8
    "Phase 5 — Layer 5 (Planned)" : 6
    "Phase 6 — Layer 6 (Planned)" : 20
```

## Detailed Status

### Phase 1: Layer 0 — Data Models & Protocols ✅ Done

| Task | Status | Description |
|------|--------|-------------|
| 1.1 | ✅ Done | MBC constants and storage keys |
| 1.2 | ✅ Done | Data model interfaces and Zod schemas |
| 1.3 | ✅ Done | MBC helper utilities (formatIDR, formatDuration) |
| 2.1 | ✅ Done | NfcProtocol interface |
| 2.2 | ✅ Done | IndexedDbProtocol interface |

**Files created:**
- `src/utils/constants/mbc-keys.ts`
- `src/@core/services/mbc/models/card-data.model.ts`
- `src/@core/services/mbc/models/service-type.model.ts`
- `src/@core/services/mbc/models/common.model.ts`
- `src/@core/services/mbc/models/schemas.ts`
- `src/@core/services/mbc/models/index.ts`
- `src/utils/helpers/mbc.helper.ts`
- `src/@core/protocols/nfc/index.ts`
- `src/@core/protocols/indexed-db/index.ts`

### Phase 2: Layer 1 — Pure Logic Services 🔄 In Progress

| Task | Status | Description |
|------|--------|-------------|
| 3.1 | 🔄 In Progress | pricing.service implementation |
| 3.2* | 📋 Planned | Property tests: Ceiling Rounding (P8) |
| 3.3* | 📋 Planned | Property tests: Pricing Consistency (P9) |
| 3.4 | 📋 Planned | card-data.service implementation |
| 3.5* | 📋 Planned | Property tests: Serialization Round-Trip (P1) |
| 3.6* | 📋 Planned | Property tests: Balance Conservation Top-Up (P3) |
| 3.7* | 📋 Planned | Property tests: Balance Conservation Check-Out (P4) |
| 3.8* | 📋 Planned | Property tests: Exactly-Once Deduction (P5) |
| 3.9* | 📋 Planned | Property tests: Check-In Exclusivity (P6) |
| 3.10* | 📋 Planned | Property tests: Transaction Log Bounded (P7) |
| 3.11 | 📋 Planned | silent-shield.service implementation |
| 3.12* | 📋 Planned | Property tests: Encryption Round-Trip (P2) |

**Note:** Tasks marked with `*` are optional property tests.

### Phase 3: Layer 2-3 — I/O Adapters & Stateful Services 📋 Planned

| Task | Status | Description |
|------|--------|-------------|
| 5.1 | 📋 Planned | webNfcAdapter (NDEFReader wrapper) |
| 5.2 | 📋 Planned | indexedDbAdapter |
| 6.1 | 📋 Planned | nfc.service |
| 6.2 | 📋 Planned | resilient-storage.service |
| 6.3 | 📋 Planned | device.service |
| 6.4 | 📋 Planned | service-registry.service |
| 6.5* | 📋 Planned | Unit tests for stateful services |
| 7.1 | 📋 Planned | MBC protocol DI container |
| 7.2 | 📋 Planned | MBC service DI container |
| 7.3 | 📋 Planned | Wire into root container |

### Phase 4: Layer 4 — Use Cases 📋 Planned

| Task | Status | Description |
|------|--------|-------------|
| 9.1 | 📋 Planned | RegisterMember use case |
| 9.2 | 📋 Planned | TopUpBalance use case |
| 9.3 | 📋 Planned | CheckIn use case |
| 9.4 | 📋 Planned | CheckOut use case |
| 9.5* | 📋 Planned | Property test: Device Binding (P10) |
| 9.6 | 📋 Planned | ReadCard use case |
| 9.7 | 📋 Planned | ManualCalculation use case |
| 9.8 | 📋 Planned | ManageServiceRegistry use case |
| 9.9* | 📋 Planned | Unit tests for use cases |
| 11.1 | 📋 Planned | Use case DI container |

### Phase 5: Layer 5 — Controllers 📋 Planned

| Task | Status | Description |
|------|--------|-------------|
| 12.1 | 📋 Planned | role-picker.controller |
| 12.2 | 📋 Planned | station.controller |
| 12.3 | 📋 Planned | gate.controller |
| 12.4 | 📋 Planned | terminal.controller |
| 12.5 | 📋 Planned | scout.controller |
| 12.6 | 📋 Planned | Controller DI container |
| 12.7* | 📋 Planned | Controller unit tests |

### Phase 6: Layer 6 — Presentation & PWA 📋 Planned

| Task | Status | Description |
|------|--------|-------------|
| 14.1-14.10 | 📋 Planned | 10 reusable components |
| 14.11* | 📋 Planned | Component tests |
| 15.1-15.5 | 📋 Planned | 5 pages |
| 16.1 | 📋 Planned | TanStack Router routes |
| 18.1 | 📋 Planned | PWA setup (vite-plugin-pwa) |
| 18.2 | 📋 Planned | Web app manifest |
| 18.3* | 📋 Planned | Offline integration test |

## Completion Summary

| Phase | Required Tasks | Optional Tasks | Done | Progress |
|-------|---------------|----------------|------|----------|
| Phase 1 | 5 | 0 | 5 | ✅ 100% |
| Phase 2 | 3 | 9 | 0 | 🔄 ~25% |
| Phase 3 | 8 | 1 | 0 | 📋 0% |
| Phase 4 | 8 | 2 | 0 | 📋 0% |
| Phase 5 | 6 | 1 | 0 | 📋 0% |
| Phase 6 | 18 | 2 | 0 | 📋 0% |
| **Total** | **48** | **15** | **5** | **~10%** |

## Related Pages

- [Clean Architecture](../01-Architecture/Clean-Architecture) — Layer definitions
- [Test Coverage Matrix](../06-Testing/Test-Coverage-Matrix) — Test status per requirement
- [Getting Started](Getting-Started) — How to run and test
