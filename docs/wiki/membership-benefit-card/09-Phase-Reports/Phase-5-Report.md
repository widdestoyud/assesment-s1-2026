# Laporan Fase 5: Layer 5 — Controllers

> Tanggal selesai: April 30, 2026
> Status: ✅ Complete
> Milestone: [Phase 5: Layer 5 - Controllers](https://github.com/widdestoyud/assesment-s1-2026/milestone/5) (Closed)
> Issues: #23, #24 (All closed)
> Branch: `feat/mbc-phase-5-controllers` → PR [#39](https://github.com/widdestoyud/assesment-s1-2026/pull/39) (squash merged)

---

## Ringkasan

Fase 5 mengimplementasikan 5 controllers yang menjembatani use cases (Layer 4) dengan presentation layer (Layer 6). Controllers adalah **pure factory functions** yang menerima dependencies via Awilix DI dan menggunakan React hooks (useState, useEffect, useCallback) untuk state management.

Setiap controller mengembalikan typed interface yang berisi data dan event handlers — presentation layer hanya perlu render berdasarkan interface ini tanpa mengetahui business logic.

**Highlight:** 22 controller tests menggunakan `renderHook` dari React Testing Library.

---

## Scope Pekerjaan

| Task | Deskripsi | Status |
|------|-----------|--------|
| 12.1 | role-picker.controller — pilih mode operasi | ✅ Done |
| 12.2 | station.controller — registrasi, top-up, service config | ✅ Done |
| 12.3 | gate.controller — check-in, simulation mode, device binding | ✅ Done |
| 12.4 | terminal.controller — check-out, manual calculation | ✅ Done |
| 12.5 | scout.controller — baca kartu (read-only) | ✅ Done |
| 12.6 | MBC controller DI container | ✅ Done |
| 12.7* | Unit tests untuk semua controllers | ✅ Done |

---

## Deliverables

### Controller Files

| File | Interface | Dependencies (via DI) | State Managed |
|------|-----------|----------------------|---------------|
| `src/controllers/mbc/role-picker.controller.ts` | `RolePickerControllerInterface` | useState, useCallback | activeRole |
| `src/controllers/mbc/station.controller.ts` | `StationControllerInterface` | useState, useEffect, useCallback, registerMemberUseCase, topUpBalanceUseCase, manageBenefitRegistryUseCase, nfcService, storageHealthService | nfcStatus, lastResult, isProcessing, error, benefitTypes, storageWarning |
| `src/controllers/mbc/gate.controller.ts` | `GateControllerInterface` | useState, useEffect, useCallback, checkInUseCase, manageBenefitRegistryUseCase, deviceService | selectedBenefitType, simulationMode, simulationTimestamp, nfcStatus, lastResult, isProcessing, error, deviceId |
| `src/controllers/mbc/terminal.controller.ts` | `TerminalControllerInterface` | useState, useEffect, useCallback, checkOutUseCase, manualCalculationUseCase, manageBenefitRegistryUseCase, deviceService | nfcStatus, lastResult, isProcessing, error, isManualMode, manualResult, benefitTypes |
| `src/controllers/mbc/scout.controller.ts` | `ScoutControllerInterface` | useState, useEffect, useCallback, readCardUseCase, manageBenefitRegistryUseCase | nfcStatus, cardData, isReading, error, benefitTypes |

### DI Wiring

| File | Fungsi |
|------|--------|
| `src/infrastructure/di/registry/mbcControllerContainer.ts` | Register 5 MBC controllers via `asFunction()` |
| `src/infrastructure/di/container.ts` (modified) | Import `registerMbcControllerModules`, add `MbcControllerContainerInterface` to `AwilixRegistry` |

### Test Files

| File | Tests |
|------|-------|
| `src/controllers/__tests__/mbc/role-picker.controller.test.ts` | 5 |
| `src/controllers/__tests__/mbc/scout.controller.test.ts` | 4 |
| `src/controllers/__tests__/mbc/gate.controller.test.ts` | 6 |
| `src/controllers/__tests__/mbc/terminal.controller.test.ts` | 7 |

**Total fase 5: 22 tests baru**
**Total kumulatif: 119 tests, 18 test files**

---

## Test Report

### Test Scenarios per Controller

#### role-picker.controller — 5 tests

| # | Scenario | Category |
|---|----------|----------|
| 1 | Provides 4 role options | ✅ Positive |
| 2 | Starts with no active role | ✅ Positive |
| 3 | Sets active role on selection | ✅ Positive |
| 4 | Changes active role on re-selection | ✅ Positive |
| 5 | Each role has label, description, icon | 🔶 Edge |

#### gate.controller — 6 tests

| # | Scenario | Category |
|---|----------|----------|
| 1 | Starts in idle state | ✅ Positive |
| 2 | Ensures device ID on mount | ✅ Positive |
| 3 | Auto-selects when only one benefit type | ✅ Positive |
| 4 | Toggles simulation mode | ✅ Positive |
| 5 | Performs check-in successfully | ✅ Positive |
| 6 | Handles check-in error | ❌ Negative |

#### terminal.controller — 7 tests

| # | Scenario | Category |
|---|----------|----------|
| 1 | Starts in idle state | ✅ Positive |
| 2 | Performs check-out successfully | ✅ Positive |
| 3 | Handles check-out error | ❌ Negative |
| 4 | Toggles manual mode | ✅ Positive |
| 5 | Performs manual calculation | ✅ Positive |
| 6 | Handles manual calculation error | ❌ Negative |
| 7 | Clears manual result when toggling mode off | 🔶 Edge |

#### scout.controller — 4 tests

| # | Scenario | Category |
|---|----------|----------|
| 1 | Starts in idle state with no card data | ✅ Positive |
| 2 | Loads service types on mount | ✅ Positive |
| 3 | Reads card successfully | ✅ Positive |
| 4 | Handles read error | ❌ Negative |

---

## Keputusan Arsitektur

| Keputusan | Alasan |
|-----------|--------|
| **React hooks via DI** | useState, useEffect, useCallback diinject via Awilix. Controllers tidak import React langsung — memudahkan testing dan menjaga layer boundary. |
| **Processing lock** | `isProcessing` flag mencegah double-tap. Saat true, semua NFC operations di-ignore. |
| **Auto-select benefit type** | Gate controller auto-select jika hanya 1 benefit type di registry. Mengurangi friction untuk operator. |
| **Lazy init di mount** | useEffect pada mount untuk load service types, ensure device ID, check storage health. Async operations di-handle gracefully. |
| **renderHook testing** | Controllers adalah custom hooks — ditest dengan `renderHook` + `act` dari React Testing Library. |

---

## Requirements Covered

| Requirement | Controller |
|-------------|-----------|
| Req 1.1, 1.2 | role-picker |
| Req 4.1-4, 5.1-5, 15.1-4, 20.4, 20.7 | station |
| Req 6.1-8, 7.1-4, 17.1-5, 19.2 | gate |
| Req 8.1-12, 21.1-8 | terminal |
| Req 9.1-4 | scout |
