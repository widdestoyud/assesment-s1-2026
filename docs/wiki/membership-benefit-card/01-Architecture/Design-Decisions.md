# Design Decisions

> Covers: Req 11, Req 13, Req 14, Req 18, Req 19, Req 20

## Overview

This page documents key architectural decisions in ADR (Architecture Decision Record) style — why we chose X over Y.

## ADR-1: Web NFC API as Sole NFC Interface

**Context:** Need to read/write NFC cards from a web application.

**Decision:** Use the Web NFC API (`NDEFReader`) — the only NFC interface available in browsers.

**Consequences:**
- ✅ No native app required — pure PWA
- ✅ Single codebase for all devices
- ⚠️ Limited to Chrome Android 89+ (no iOS, no desktop)
- ⚠️ NDEF text records only — no low-level NFC commands

## ADR-2: No Backend, Card as Database

**Context:** Government cooperative program needs simple, offline-capable data storage.

**Decision:** Store all data (identity, balance, status, history) directly on the NFC card. Zero backend, zero database.

**Consequences:**
- ✅ 100% offline after initial PWA install
- ✅ No server costs, no infrastructure
- ✅ Data travels with the physical card
- ⚠️ Limited by NFC tag memory (NTAG215: 504B, NTAG216: 888B)
- ⚠️ Data loss if card is physically damaged
- ⚠️ No centralized audit trail

## ADR-3: JSON Serialization over Binary

**Context:** Card data must fit in limited NFC tag memory.

**Decision:** Use compact JSON serialization (JSON.stringify → UTF-8 encode) instead of custom binary format.

**Rationale:**
- JSON is debuggable — can inspect raw card data during development
- JSON.parse/stringify are native and fast
- Zod validation works directly on parsed JSON
- Still fits within NTAG216 (888B) for typical card data

**Trade-off:** ~30% larger than binary, but within memory limits for the data we store.

## ADR-4: AES-256-GCM Obfuscation (Silent Shield)

**Context:** Card data should not be readable by third-party NFC apps.

**Decision:** Encrypt card data with AES-256-GCM using a hardcoded app-level key derived via PBKDF2.

**Rationale:**
- This is **obfuscation, not security-grade encryption** — the key is in the client-side code
- Goal: prevent casual NFC reader apps from reading plain text member data
- AES-256-GCM provides authenticated encryption (integrity + confidentiality)
- `crypto-browserify` is already polyfilled in the project

**Consequences:**
- ✅ Third-party NFC apps see encrypted bytes, not plain JSON
- ✅ GCM auth tag detects tampering
- ⚠️ Determined attacker can extract the key from JS source
- ⚠️ Key rotation requires re-writing all cards

## ADR-5: Atomic Write with Snapshot/Rollback

**Context:** NFC writes can fail mid-operation (card removed, connection lost). Partial writes corrupt data.

**Decision:** Implement a snapshot → write → verify → rollback pipeline for every write operation.

**Rationale:**
- Capture pre-operation state before any mutation
- Write all changes as a single unit
- Read back and compare to verify
- On mismatch: restore snapshot to card

See [Atomic Write Pipeline](../04-Technical-Flows/Atomic-Write-Pipeline) for the full state machine.

## ADR-6: Device Binding via Device_ID

**Context:** Check-out must happen on the same device as check-in to prevent fraud.

**Decision:** Generate a unique `Device_ID` on first launch, persist in localStorage, write to card during check-in, validate during check-out.

**Consequences:**
- ✅ Prevents cross-device check-out fraud
- ⚠️ If device storage is cleared, existing check-ins cannot be checked out on that device
- ⚠️ Requires warning UI when Device_ID is regenerated

See [Device Binding](../04-Technical-Flows/Device-Binding) for the full lifecycle.

## ADR-7: localStorage Persistence with Graceful Error Handling

**Context:** Device_ID and Service Registry must survive app restarts. Storage errors must be handled gracefully.

**Decision:** Use localStorage as the single storage mechanism via `KeyValueStoreProtocol`, with explicit error handling for unavailability and quota limits.

**Rationale:**
- localStorage: synchronous, simple, widely supported across all browsers
- Single storage layer reduces complexity — no dual-layer orchestration needed
- Error handling covers the realistic failure modes: unavailable (private mode) and quota exceeded
- All storage access goes through `KeyValueStoreProtocol` interface, so the implementation can be swapped later if needed

**Consequences:**
- ✅ Simpler architecture, fewer moving parts
- ✅ Every business error is handled and communicated to the user
- ✅ Swappable via DI if requirements change in the future
- ⚠️ No redundancy — if localStorage is cleared, data is lost
- ⚠️ Limited quota (~5-10 MB), sufficient for current data needs

See [Storage Architecture](../04-Technical-Flows/Storage-Architecture) for error handling flows.

## ADR-8: Extensible Benefit Type Architecture

**Context:** Initial requirement is parking, but the system should support bike rental, gym, restaurant, VIP, etc.

**Decision:** Abstract benefit types with pluggable pricing strategies (`per-hour`, `per-visit`, `flat-fee`).

**Consequences:**
- ✅ New benefit types added via configuration, not code changes
- ✅ Each benefit type has its own pricing rules
- ✅ Default parking benefit pre-configured
- ⚠️ Benefit type must exist in registry at check-out time

## ADR-9: Controllers as Pure Factory Functions

**Context:** Need to separate business logic from React components.

**Decision:** Controllers are pure factory functions that receive all dependencies via Awilix DI and return a typed interface. Controllers use only `import type` — every runtime value comes from `AwilixRegistry`.

**Consequences:**
- ✅ Controllers are testable without React
- ✅ No hidden dependencies
- ✅ Clear contract between controller and view
- ⚠️ Slightly more boilerplate than hooks-based approach

## ADR-10: Bottom-Up Build Order (Start with Bricks)

**Context:** Need a reliable build strategy for a complex feature with many interdependent modules.

**Decision:** Build strictly bottom-up: Layer 0 → 1 → 2 → 3 → 4 → 5 → 6. Each layer is fully tested before moving up.

**Rationale:**
- Pure functions (Layer 0-1) can be tested with zero mocking
- Each layer only depends on layers below it — no forward dependencies
- Checkpoints at each layer boundary catch issues early

## Related Pages

- [Clean Architecture](Clean-Architecture) — Layer rules and dependency direction
- [Atomic Write Pipeline](../04-Technical-Flows/Atomic-Write-Pipeline) — ADR-5 implementation
- [Device Binding](../04-Technical-Flows/Device-Binding) — ADR-6 implementation
- [Silent Shield Encryption](../04-Technical-Flows/Silent-Shield-Encryption) — ADR-4 implementation
- [Storage Architecture](../04-Technical-Flows/Storage-Architecture) — ADR-7 implementation
