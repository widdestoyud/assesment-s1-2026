# Test Coverage Matrix

> Covers: All 22 requirements

## Overview

This matrix maps each requirement to its corresponding test files and correctness properties. It tracks which requirements have test coverage and which are pending.

## Requirement → Test Mapping

| Req | Description | Test File(s) | Property | Status |
|-----|-------------|-------------|----------|--------|
| 1 | Role Mode Switching | `role-picker.controller.test.ts`, `RoleCard.test.tsx` | — | 📋 Planned |
| 2 | NFC Card Reading | `nfc.service.test.ts` | — | 📋 Planned |
| 3 | NFC Card Writing | `nfc.service.test.ts`, use case tests | — | 📋 Planned |
| 4 | Member Registration | `RegisterMember.test.ts`, `station.controller.test.ts` | — | 📋 Planned |
| 5 | Balance Top-Up | `TopUpBalance.test.ts`, `card-data.service.test.ts` | P3 | 📋 Planned |
| 6 | Generic Check-In | `CheckIn.test.ts`, `card-data.service.test.ts` | P6 | 📋 Planned |
| 7 | Simulation Mode | `gate.controller.test.ts` | — | 📋 Planned |
| 8 | Generic Check-Out | `CheckOut.test.ts`, `card-data.service.test.ts` | P4, P5, P6 | 📋 Planned |
| 9 | Card Info Display | `ReadCard.test.ts`, `CardInfoDisplay.test.tsx` | — | 📋 Planned |
| 10 | Transaction Log | `card-data.service.test.ts` | P7 | 📋 Planned |
| 11 | Silent Shield | `silent-shield.service.test.ts` | P2 | 📋 Planned |
| 12 | Pricing Engine | `pricing.service.test.ts` | P8, P9 | 🔄 In Progress |
| 13 | Schema Serialization | `card-data.service.test.ts` | P1 | 🔄 In Progress |
| 14 | Offline-First PWA | Integration test (offline capability) | — | 📋 Planned |
| 15 | Service Config | `ManageServiceRegistry.test.ts`, `service-registry.service.test.ts` | — | 📋 Planned |
| 16 | Extensible Service Types | `service-registry.service.test.ts` | — | 📋 Planned |
| 17 | Service Selection | `gate.controller.test.ts`, `ServiceTypeSelector.test.tsx` | — | 📋 Planned |
| 18 | Atomic Integrity | `CheckOut.test.ts`, `nfc.service.test.ts` | P4, P5 | 📋 Planned |
| 19 | Device Binding | `CheckOut.test.ts`, `device.service.test.ts` | P10 | 📋 Planned |
| 20 | Data Persistence | `storage-health.service.test.ts`, `service-registry.service.test.ts` | — | 📋 Planned |
| 21 | Manual Fallback | `ManualCalculation.test.ts`, `terminal.controller.test.ts` | — | 📋 Planned |
| 22 | NFC Capability Detection | `role-picker.controller.test.ts` | — | 📋 Planned |

## Existing Test Files

| Test File | Status | Layer |
|-----------|--------|-------|
| `card-data.service.test.ts` | ✅ Exists | Layer 1 |
| `pricing.service.test.ts` | ✅ Exists | Layer 1 |
| `silent-shield.service.test.ts` | ✅ Exists | Layer 1 |

## Coverage by Layer

| Layer | Total Tests | Implemented | Coverage |
|-------|------------|-------------|----------|
| Layer 0 — Models | Type checks | ✅ | TypeScript compiler |
| Layer 1 — Pure services | 3 test files | 🔄 Partial | In progress |
| Layer 2 — I/O adapters | 2 test files | 📋 | Planned |
| Layer 3 — Stateful services | 4 test files | 📋 | Planned |
| Layer 4 — Use cases | 7 test files | 📋 | Planned |
| Layer 5 — Controllers | 5 test files | 📋 | Planned |
| Layer 6 — Components | 7 test files | 📋 | Planned |

## Related Pages

- [Testing Strategy](Testing-Strategy) — Overall testing approach
- [Correctness Properties](Correctness-Properties) — 10 formal properties
- [Phase Progress](../07-Development/Phase-Progress) — Implementation status
