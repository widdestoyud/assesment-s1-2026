# Implementation Plan: Membership Benefit Card (MBC)

## Overview

This plan implements the MBC feature following a strict bottom-up build order: data models first, then pure logic services, then I/O adapters, then stateful services, then use cases, then controllers, and finally presentation. Each layer only depends on layers below it. All code uses TypeScript with the project's existing Clean Architecture patterns (Awilix DI, controller pattern, SCSS Modules + Tailwind CSS 4, Vitest).

## Tasks

- [x] 1. Layer 0 — Data models, types, Zod schemas, and constants
  - [x] 1.1 Create MBC constants and storage keys
    - Create `src/utils/constants/mbc-keys.ts` with MBC-specific storage keys (`MBC_DEVICE_ID`, `MBC_SERVICE_REGISTRY`), storage config (`STORE_NAME`), and Silent Shield config constants
    - Export from `src/utils/constants/index.ts`
    - Register in DI container via `helperContainer.ts`
    - _Requirements: 19.1, 19.6, 20.1_

  - [x] 1.2 Create MBC data model interfaces and Zod schemas
    - Create `src/@core/services/mbc/models/card-data.model.ts` with `CardData`, `MemberIdentity`, `CheckInStatus`, `TransactionLogEntry` interfaces
    - Create `src/@core/services/mbc/models/service-type.model.ts` with `ServiceType`, `PricingStrategy` interfaces and `DEFAULT_PARKING_SERVICE` constant
    - Create `src/@core/services/mbc/models/common.model.ts` with `RoleMode`, `NfcStatus`, `NfcError`, `FeeResult`, `CheckInResult`, `CheckOutResult`, `OperationResult`, `AtomicWriteResult`, `AtomicWriteError`, `WriteVerifyResult`, `StorageError`, `NfcPermissionResult`, `NfcScanSession` types
    - Create `src/@core/services/mbc/models/schemas.ts` with Zod schemas: `CardDataSchema`, `ServiceTypeFormSchema`, `RegistrationFormSchema`, `TopUpFormSchema`, `ManualCalcFormSchema`
    - Create `src/@core/services/mbc/models/index.ts` barrel export
    - _Requirements: 13.1, 12.2-3, 1.1, 15.2_

  - [x] 1.3 Create MBC helper utilities
    - Create `src/utils/helpers/mbc.helper.ts` with IDR currency formatting (`formatIDR`), duration formatting (`formatDuration`), ISO timestamp helpers
    - Export from `src/utils/helpers/index.ts`
    - _Requirements: 8.9, 9.3_

- [x] 2. Layer 0 — Protocols (interfaces)
  - [x] 2.1 Create NfcProtocol interface
    - Create `src/@core/protocols/nfc/index.ts` with `NfcProtocol` interface (`isSupported`, `requestPermission`, `startScan`, `write`)
    - _Requirements: 2.1, 2.2, 2.4, 3.1_

  - [x] 2.2 ~~Create IndexedDbProtocol interface~~ (Removed — simplified to localStorage-only)
    - IndexedDbProtocol is no longer needed. Storage uses existing `KeyValueStoreProtocol` with `webStorageAdapter`.
    - _Requirements: 20.1_

- [x] 3. Layer 1 — Pure logic services (stateless, no I/O)
  - [x] 3.1 Implement pricing.service
    - Create `src/@core/services/mbc/pricing.service.ts` with `PricingServiceInterface` and `PricingService` factory function
    - Implement `calculateFee(strategy, checkInTime, checkOutTime)` returning `FeeResult`
    - Support `per-hour` (duration-based with rounding), `per-visit` (single charge), `flat-fee` (fixed amount)
    - Support `ceiling`, `floor`, `nearest` rounding strategies
    - Pure function — no DI dependencies beyond types
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]* 3.2 Write property tests for pricing.service (Property 8: Ceiling Rounding)
    - **Property 8: Ceiling Rounding Fare Calculation**
    - For per-hour pricing with ceiling rounding, fee = `Math.ceil(hours) * rate`
    - Install `fast-check` as a dev dependency
    - Create `src/@core/services/__tests__/mbc/pricing.service.test.ts`
    - Use `fast-check` arbitraries for duration and rate
    - **Validates: Requirements 12.1, 12.2, 12.3**

  - [ ]* 3.3 Write property tests for pricing.service (Property 9: Pricing Strategy Consistency)
    - **Property 9: Pricing Strategy Consistency**
    - For per-visit pricing, fee = `rate_per_unit` regardless of duration
    - For flat-fee pricing, fee = `rate_per_unit` regardless of duration
    - Add to `src/@core/services/__tests__/mbc/pricing.service.test.ts`
    - **Validates: Requirements 12.5, 12.6**

  - [x] 3.4 Implement card-data.service
    - Create `src/@core/services/mbc/card-data.service.ts` with `CardDataServiceInterface` and `CardDataService` factory function
    - Implement `serialize(card)` → `Uint8Array` (JSON stringify → UTF-8 encode)
    - Implement `deserialize(raw)` → `CardData` (UTF-8 decode → JSON parse → Zod validate)
    - Implement `validate(card)` using `CardDataSchema`
    - Implement pure mutation functions: `applyRegistration`, `applyTopUp`, `applyCheckIn`, `applyCheckOut`, `appendTransactionLog`
    - `appendTransactionLog` enforces max 5 entries (removes oldest when full)
    - `applyCheckIn` rejects if `checkIn` is already active
    - `applyCheckOut` rejects if `checkIn` is null, clears `checkIn` status, deducts fee
    - Pure functions — no DI dependencies beyond types and Zod schemas
    - _Requirements: 13.1, 13.2, 13.3, 13.5, 4.2, 5.2, 6.2, 8.6, 10.1, 10.2_

  - [ ]* 3.5 Write property tests for card-data.service (Property 1: Serialization Round-Trip)
    - **Property 1: Serialization Round-Trip**
    - For all valid CardData objects, `deserialize(serialize(card))` equals `card`
    - Create `src/@core/services/__tests__/mbc/card-data.service.test.ts`
    - Use `fast-check` to generate arbitrary valid CardData objects
    - **Validates: Requirements 13.4**

  - [ ]* 3.6 Write property tests for card-data.service (Property 3: Balance Conservation Top-Up)
    - **Property 3: Balance Conservation (Top-Up)**
    - For all valid cards and positive amounts, `applyTopUp(card, a).balance === card.balance + a`
    - Add to `src/@core/services/__tests__/mbc/card-data.service.test.ts`
    - **Validates: Requirements 5.2**

  - [ ]* 3.7 Write property tests for card-data.service (Property 4: Balance Conservation Check-Out)
    - **Property 4: Balance Conservation (Check-Out)**
    - For checked-in cards with fee <= balance, `applyCheckOut(card, f).balance === card.balance - f` and balance >= 0
    - Add to `src/@core/services/__tests__/mbc/card-data.service.test.ts`
    - **Validates: Requirements 8.6, 18.7**

  - [ ]* 3.8 Write property tests for card-data.service (Property 5: Exactly-Once Deduction)
    - **Property 5: Exactly-Once Deduction**
    - Applying check-out to an already checked-out card is rejected (no active CheckInStatus)
    - Add to `src/@core/services/__tests__/mbc/card-data.service.test.ts`
    - **Validates: Requirements 8.8, 18.7**

  - [ ]* 3.9 Write property tests for card-data.service (Property 6: Check-In Status Exclusivity)
    - **Property 6: Check-In Status Exclusivity**
    - A checked-in card cannot be checked in again; a not-checked-in card cannot be checked out
    - Add to `src/@core/services/__tests__/mbc/card-data.service.test.ts`
    - **Validates: Requirements 6.3, 8.8**

  - [ ]* 3.10 Write property tests for card-data.service (Property 7: Transaction Log Bounded Size)
    - **Property 7: Transaction Log Bounded Size**
    - After any operation, `transactions.length <= 5`
    - Add to `src/@core/services/__tests__/mbc/card-data.service.test.ts`
    - **Validates: Requirements 10.2**

  - [x] 3.11 Implement silent-shield.service
    - Create `src/@core/services/mbc/silent-shield.service.ts` with `SilentShieldServiceInterface` and `SilentShieldService` factory function
    - Implement `encrypt(data)` → `Uint8Array` using AES-256-GCM via `crypto-browserify`
    - Implement `decrypt(data)` → `Uint8Array`
    - Key derivation: PBKDF2 with hardcoded salt/passphrase from MBC constants
    - IV: random 12 bytes per write, prepended to ciphertext
    - Output format: `[IV (12B) | ciphertext | authTag (16B)]`
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 3.12 Write property tests for silent-shield.service (Property 2: Encryption Round-Trip)
    - **Property 2: Encryption Round-Trip**
    - For all valid byte arrays, `decrypt(encrypt(data))` equals `data`
    - Create `src/@core/services/__tests__/mbc/silent-shield.service.test.ts`
    - Use `fast-check` to generate arbitrary Uint8Array data
    - **Validates: Requirements 11.4**

- [ ] 4. Checkpoint — Verify pure logic layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Layer 2 — I/O adapters (protocol implementations)
  - [x] 5.1 Implement webNfcAdapter
    - Create `src/infrastructure/nfc/webNfcAdapter.ts` implementing `NfcProtocol`
    - Wrap `NDEFReader` API: `isSupported()` checks `'NDEFReader' in window`
    - `requestPermission()` attempts a scan to trigger browser permission prompt
    - `startScan(onRead, onError)` creates `NDEFReader`, calls `scan()`, returns `NfcScanSession` with `abort()`
    - `write(data)` creates `NDEFReader`, writes single NDEF text record
    - Handle all Web NFC error types and map to `NfcError`
    - _Requirements: 2.1, 2.2, 2.4, 3.1_

- [x] 6. Layer 3 — Stateful services (compose pure logic + I/O adapters via DI)
  - [x] 6.1 Implement nfc.service
    - Create `src/@core/services/mbc/nfc.service.ts` with `NfcServiceInterface` and `NfcService` factory function
    - Depends on `NfcProtocol` (via DI), `CardDataService`, `SilentShieldService`
    - `readCard()`: scan → read raw NDEF → return raw bytes
    - `writeCard(data)`: write bytes as NDEF text record
    - `writeAndVerify(data)`: write → read back → compare → return `WriteVerifyResult`
    - _Requirements: 2.1, 3.1, 3.4, 3.7_

  - [x] 6.2 Implement storage-health.service
    - Create `src/@core/services/mbc/storage-health.service.ts` with `StorageHealthServiceInterface` and `StorageHealthService` factory function
    - Depends on `KeyValueStoreProtocol` (via DI)
    - `isAvailable()`: check if localStorage is accessible and writable
    - `checkWriteCapacity()`: attempt a test write, detect quota exceeded errors, return `{ canWrite, error? }`
    - _Requirements: 20.2, 20.3, 20.4_

  - [x] 6.3 Implement device.service
    - Create `src/@core/services/mbc/device.service.ts` with `DeviceServiceInterface` and `DeviceService` factory function
    - Depends on `KeyValueStoreProtocol` (via DI)
    - `getDeviceId()`: read from localStorage via KeyValueStoreProtocol
    - `ensureDeviceId()`: get or generate via `crypto.randomUUID()`, persist, return `{ deviceId, wasRegenerated }`
    - On regeneration, flag `wasRegenerated: true` so UI can show warning
    - Handle storage write failures gracefully with `StorageError`
    - _Requirements: 19.1, 19.6, 19.7, 20.8_

  - [x] 6.4 Implement service-registry.service
    - Create `src/@core/services/mbc/service-registry.service.ts` with `ServiceRegistryServiceInterface` and `ServiceRegistryService` factory function
    - Depends on `KeyValueStoreProtocol` (via DI)
    - Implement `getAll`, `getById`, `add`, `update`, `remove`, `initializeDefaults`
    - `initializeDefaults()`: check if registry exists, if not create with `DEFAULT_PARKING_SERVICE`
    - Validate service type data integrity on read using Zod schema
    - Handle storage write failures gracefully with `StorageError`
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 20.5, 20.6, 20.8_

  - [x]* 6.5 Write unit tests for stateful services
    - Create `src/@core/services/__tests__/mbc/device.service.test.ts` — test Device_ID generation, persistence, regeneration warning, storage failure handling
    - Create `src/@core/services/__tests__/mbc/storage-health.service.test.ts` — test availability check, write capacity check, quota exceeded detection
    - Create `src/@core/services/__tests__/mbc/service-registry.service.test.ts` — test CRUD, default initialization, validation, storage failure handling
    - Mock `KeyValueStoreProtocol` via partial `AwilixRegistry`
    - _Requirements: 19.1, 19.7, 20.1, 20.2, 20.3, 20.4, 15.5, 15.6, 15.7, 20.8_

- [x] 7. Layer 2-3 — DI container registration
  - [x] 7.1 Create MBC protocol container
    - Create `src/infrastructure/di/registry/mbcProtocolContainer.ts`
    - Register `nfcProtocol` → `webNfcAdapter`
    - Export `MbcProtocolContainerInterface`
    - _Requirements: 2.1_

  - [x] 7.2 Create MBC service container
    - Create `src/infrastructure/di/registry/mbcServiceContainer.ts`
    - Register all MBC services: `pricingService`, `cardDataService`, `silentShieldService`, `nfcService`, `deviceService`, `storageHealthService`, `serviceRegistryService`
    - Use `asFunction(...).singleton()` for stateful services
    - Export `MbcServiceContainerInterface`
    - _Requirements: 12.1, 13.1, 11.1, 2.1, 19.1, 20.1, 15.1_

  - [x] 7.3 Wire MBC containers into root container
    - Update `src/infrastructure/di/container.ts` to import and call `registerMbcProtocolModules`, `registerMbcServiceModules`
    - Add `MbcProtocolContainerInterface` and `MbcServiceContainerInterface` to `AwilixRegistry` type union
    - _Requirements: all_

- [x] 8. Checkpoint — Verify services and DI wiring
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Layer 4 — Use cases (orchestrate services)
  - [x] 9.1 Implement RegisterMember use case
    - Create `src/@core/use_case/mbc/RegisterMember.ts`
    - Orchestrate: read card → decrypt → deserialize → validate blank card → apply registration → serialize → encrypt → atomic write with verify
    - Reject if card already has member data
    - Return `OperationResult` with member details and initial balance 0
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 3.5, 18.1_

  - [x] 9.2 Implement TopUpBalance use case
    - Create `src/@core/use_case/mbc/TopUpBalance.ts`
    - Orchestrate: read card → decrypt → deserialize → validate registered card → apply top-up → append transaction log → serialize → encrypt → atomic write with verify
    - Reject if card is not registered
    - Return `OperationResult` with previous balance, amount, new balance
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.1, 3.5, 18.1_

  - [x] 9.3 Implement CheckIn use case
    - Create `src/@core/use_case/mbc/CheckIn.ts`
    - Orchestrate: read card → decrypt → deserialize → validate no active check-in → apply check-in (timestamp, serviceTypeId, deviceId) → serialize → encrypt → atomic write with verify
    - Reject if already checked in (double tap-in prevention)
    - Reject if card is not registered
    - Support simulation mode: accept optional custom timestamp
    - Return `CheckInResult` with member name, entry time, service type name
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.8, 7.3, 18.1, 18.5_

  - [x] 9.4 Implement CheckOut use case
    - Create `src/@core/use_case/mbc/CheckOut.ts`
    - Orchestrate: read card → decrypt → deserialize → validate active check-in → validate device ID match → lookup service type from registry → calculate fee → validate balance sufficient → apply check-out (deduct fee, clear check-in, append transaction log) → serialize → encrypt → atomic write with verify
    - Reject if not checked in (double tap-out prevention)
    - Reject if device ID mismatch
    - Reject if insufficient balance (display shortage)
    - Reject if service type not found in registry
    - Implement snapshot + rollback on write failure
    - Return `CheckOutResult` with full fee breakdown
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 19.3, 19.4, 19.5_

  - [ ]* 9.5 Write property tests for CheckOut use case (Property 10: Device Binding Enforcement)
    - **Property 10: Device Binding Enforcement**
    - Check-out succeeds only when card's deviceId matches current device's deviceId
    - Mismatched deviceId always results in rejection
    - Create `src/@core/use_case/__tests__/mbc/CheckOut.test.ts`
    - Mock NFC and storage services
    - **Validates: Requirements 19.3, 19.4**

  - [x] 9.6 Implement ReadCard use case
    - Create `src/@core/use_case/mbc/ReadCard.ts`
    - Orchestrate: read card → decrypt → deserialize → return `CardData`
    - Read-only — no writes
    - Reject if card data is invalid/corrupted
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 2.3_

  - [x] 9.7 Implement ManualCalculation use case
    - Create `src/@core/use_case/mbc/ManualCalculation.ts`
    - Accept check-in timestamp and service type ID as input
    - Lookup service type from registry → calculate fee using current time as check-out
    - No NFC read/write — pure calculation
    - Return `FeeResult`
    - _Requirements: 21.2, 21.3, 21.4, 21.5, 21.7_

  - [x] 9.8 Implement ManageServiceRegistry use case
    - Create `src/@core/use_case/mbc/ManageServiceRegistry.ts`
    - Expose `getAll`, `add`, `update`, `remove` operations delegating to `ServiceRegistryService`
    - Initialize defaults on first access
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 16.1, 16.2, 16.3, 16.5_

  - [x]* 9.9 Write unit tests for use cases
    - Create test files in `src/@core/use_case/__tests__/mbc/` for `RegisterMember`, `TopUpBalance`, `CheckIn`, `ReadCard`, `ManualCalculation`, `ManageServiceRegistry`
    - Mock all service dependencies via partial `AwilixRegistry`
    - Test success paths, rejection conditions, and error handling
    - _Requirements: 4.2, 4.3, 5.2, 5.5, 6.2, 6.3, 8.3, 8.7, 8.8, 8.10, 9.4, 21.5_

- [x] 10. Checkpoint — Verify use cases
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Layer 4 — Use case DI registration
  - [x] 11.1 Create MBC use case container
    - Create `src/infrastructure/di/registry/mbcUseCaseContainer.ts`
    - Register all MBC use cases: `registerMemberUseCase`, `topUpBalanceUseCase`, `checkInUseCase`, `checkOutUseCase`, `readCardUseCase`, `manualCalculationUseCase`, `manageServiceRegistryUseCase`
    - Export `MbcUseCaseContainerInterface`
    - Update `src/infrastructure/di/container.ts` to import and call `registerMbcUseCaseModules`, add to `AwilixRegistry`
    - _Requirements: all use case requirements_

- [x] 12. Layer 5 — Controllers
  - [x] 12.1 Implement role-picker.controller
    - Create `src/controllers/mbc/role-picker.controller.ts` with `RolePickerControllerInterface`
    - Receive `useNavigation` from DI
    - Return `roles` array (station, gate, terminal, scout with labels/descriptions), `onSelectRole` (navigates to `/mbc/{role}`), `activeRole`
    - _Requirements: 1.1, 1.2_

  - [x] 12.2 Implement station.controller
    - Create `src/controllers/mbc/station.controller.ts` with `StationControllerInterface`
    - Receive `registerMemberUseCase`, `topUpBalanceUseCase`, `manageServiceRegistryUseCase`, `nfcService`, `useFormHook`, `zodResolver`, `zod` from DI
    - Manage registration form (name, memberId), top-up form (amount), service config CRUD
    - Handle NFC tap events: set `isProcessing` lock, execute use case, update `lastResult`
    - Manage `nfcStatus` state transitions
    - Initialize service registry defaults on mount
    - Check storage health and quota on mount, display warnings
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 15.1, 15.2, 15.3, 15.4, 20.4, 20.7_

  - [x] 12.3 Implement gate.controller
    - Create `src/controllers/mbc/gate.controller.ts` with `GateControllerInterface`
    - Receive `checkInUseCase`, `manageServiceRegistryUseCase`, `deviceService`, `nfcService` from DI
    - Manage service type selection from registry, auto-select if only one
    - Persist last selected service type
    - Handle simulation mode toggle and custom timestamp
    - Handle NFC tap: set `isProcessing` lock, execute check-in use case, update `lastResult`
    - Ensure Device_ID is available on mount via `deviceService.ensureDeviceId()`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.1, 7.2, 7.3, 7.4, 17.1, 17.2, 17.3, 17.4, 17.5, 19.2_

  - [x] 12.4 Implement terminal.controller
    - Create `src/controllers/mbc/terminal.controller.ts` with `TerminalControllerInterface`
    - Receive `checkOutUseCase`, `manualCalculationUseCase`, `manageServiceRegistryUseCase`, `deviceService`, `nfcService` from DI
    - Handle NFC tap: set `isProcessing` lock, execute check-out use case, update `lastResult` with fee breakdown
    - Manage manual calculation mode toggle, form, and result
    - Ensure Device_ID is available on mount
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12, 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8_

  - [x] 12.5 Implement scout.controller
    - Create `src/controllers/mbc/scout.controller.ts` with `ScoutControllerInterface`
    - Receive `readCardUseCase`, `nfcService`, `manageServiceRegistryUseCase` from DI
    - Handle NFC tap: read card data, resolve service type names from registry for display
    - Return `cardData`, `nfcStatus`, `isReading`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 12.6 Register MBC controllers in DI
    - Create `src/infrastructure/di/registry/mbcControllerContainer.ts`
    - Register all MBC controllers: `rolePickerController`, `stationController`, `gateController`, `terminalController`, `scoutController`
    - Export `MbcControllerContainerInterface`
    - Update `src/infrastructure/di/container.ts` to import and call `registerMbcControllerModules`, add to `AwilixRegistry`
    - _Requirements: all controller requirements_

  - [x]* 12.7 Write unit tests for controllers
    - Create test files in `src/controllers/__tests__/mbc/` for each controller
    - Mock all use case and service dependencies
    - Test NFC status transitions, form validation, processing lock behavior, simulation mode
    - _Requirements: 1.1, 1.2, 6.3, 6.8, 7.1, 8.8, 8.12, 21.1_

- [x] 13. Checkpoint — Verify controllers and DI wiring
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Layer 6 — Reusable presentation components
  - [x] 14.1 Create NfcTapPrompt component
    - Create `src/presentation/components/mbc/NfcTapPrompt/index.tsx` and `nfc-tap-prompt.module.scss`
    - Props: `nfcStatus: NfcStatus`, `isProcessing: boolean`, `label?: string`
    - Render animated tap prompt, status feedback (scanning, reading, writing, verifying, success, error)
    - Disable tap prompt while `isProcessing` is true
    - Use SCSS Modules + Tailwind for styling
    - _Requirements: 2.1, 6.1, 8.1, 9.1_

  - [x] 14.2 Create FeeBreakdown component
    - Create `src/presentation/components/mbc/FeeBreakdown/index.tsx` and `fee-breakdown.module.scss`
    - Props: `feeResult: FeeResult`, `serviceTypeName: string`
    - Display service type, usage units, rate per unit, rounding applied, total fee
    - Format amounts in IDR using `formatIDR` helper
    - _Requirements: 8.9, 12.8_

  - [x] 14.3 Create BalanceDisplay component
    - Create `src/presentation/components/mbc/BalanceDisplay/index.tsx` and `balance-display.module.scss`
    - Props: `balance: number`, `previousBalance?: number`, `changeAmount?: number`
    - Display formatted IDR balance with optional before/after states
    - _Requirements: 5.3, 8.9_

  - [x] 14.4 Create TransactionLogList component
    - Create `src/presentation/components/mbc/TransactionLogList/index.tsx` and `transaction-log-list.module.scss`
    - Props: `transactions: TransactionLogEntry[]`, `serviceTypes: ServiceType[]`
    - Render list of up to 5 transaction entries with amount, timestamp, activity type, service type name
    - Resolve service type display names from the provided `serviceTypes` array
    - _Requirements: 9.2, 9.3, 10.3_

  - [x] 14.5 Create ServiceTypeSelector component
    - Create `src/presentation/components/mbc/ServiceTypeSelector/index.tsx` and `service-type-selector.module.scss`
    - Props: `serviceTypes: ServiceType[]`, `selectedId: string | null`, `onSelect: (id: string) => void`, `disabled?: boolean`
    - Render dropdown/list of service types from props
    - _Requirements: 6.6, 17.1_

  - [x] 14.6 Create ServiceTypeForm component
    - Create `src/presentation/components/mbc/ServiceTypeForm/index.tsx` and `service-type-form.module.scss`
    - Props: `onSubmit: (data: ServiceTypeFormData) => void`, `initialValues?: Partial<ServiceType>`, `isEditing?: boolean`
    - Form fields: id, displayName, activityType, pricing (ratePerUnit, unitType, roundingStrategy)
    - Validate with `ServiceTypeFormSchema`
    - _Requirements: 15.2, 15.3_

  - [x] 14.7 Create CardInfoDisplay component
    - Create `src/presentation/components/mbc/CardInfoDisplay/index.tsx` and `card-info-display.module.scss`
    - Props: `cardData: CardData`, `serviceTypes: ServiceType[]`
    - Display member identity, balance, active check-in status with service type name, transaction log
    - Compose `BalanceDisplay` and `TransactionLogList` internally
    - _Requirements: 9.2_

  - [x] 14.8 Create SimulationBanner component
    - Create `src/presentation/components/mbc/SimulationBanner/index.tsx` and `simulation-banner.module.scss`
    - Props: `isActive: boolean`, `timestamp: string | null`
    - Render prominent visual indicator when simulation mode is active
    - _Requirements: 7.4_

  - [x] 14.9 Create ManualCalcForm component
    - Create `src/presentation/components/mbc/ManualCalcForm/index.tsx` and `manual-calc-form.module.scss`
    - Props: `onSubmit: (data: ManualCalcFormData) => void`, `serviceTypes: ServiceType[]`, `isActive: boolean`
    - Form fields: check-in timestamp (datetime picker), service type selector
    - Label as "Manual / Offline Calculation"
    - _Requirements: 21.1, 21.2, 21.6_

  - [x] 14.10 Create RoleCard component
    - Create `src/presentation/components/mbc/RoleCard/index.tsx` and `role-card.module.scss`
    - Props: `role: RoleOption`, `isActive: boolean`, `onSelect: () => void`
    - Render role icon, name, description with active state styling
    - _Requirements: 1.1_

  - [x]* 14.11 Write unit tests for presentation components
    - Create test files in `src/presentation/components/__tests__/mbc/`
    - Test `NfcTapPrompt` status rendering and disabled state
    - Test `FeeBreakdown` IDR formatting and breakdown display
    - Test `TransactionLogList` rendering with 0-5 entries
    - Test `ServiceTypeSelector` selection callback
    - Test `CardInfoDisplay` full card data rendering
    - Test `RoleCard` active state and click handler
    - Test `BalanceDisplay` before/after states
    - Use React Testing Library with `getByRole`/`getByText`
    - _Requirements: 1.1, 8.9, 9.2, 9.3, 12.8_

- [x] 15. Layer 6 — Pages
  - [x] 15.1 Create MbcRolePicker page
    - Create `src/presentation/pages/(mbc)/MbcRolePicker/index.tsx` and `mbc-role-picker.module.scss`
    - Resolve `rolePickerController` from DI container
    - Render role selection grid using `RoleCard` components
    - Display clear visual indicator of active role
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 15.2 Create MbcStation page
    - Create `src/presentation/pages/(mbc)/MbcStation/index.tsx` and `mbc-station.module.scss`
    - Resolve `stationController` from DI container
    - Render tabbed interface: Registration tab, Top-Up tab, Service Config tab
    - Registration tab: form fields + `NfcTapPrompt` + result display
    - Top-Up tab: amount input + `NfcTapPrompt` + `BalanceDisplay` result
    - Service Config tab: `ServiceTypeForm` + list of configured types with edit/remove
    - Display storage health warnings from controller
    - _Requirements: 4.1, 4.4, 5.1, 5.3, 15.1, 20.4, 20.7_

  - [x] 15.3 Create MbcGate page
    - Create `src/presentation/pages/(mbc)/MbcGate/index.tsx` and `mbc-gate.module.scss`
    - Resolve `gateController` from DI container
    - Render `ServiceTypeSelector` + `NfcTapPrompt` + check-in result display
    - Render simulation mode toggle + datetime picker when active + `SimulationBanner`
    - Show empty registry message when no service types configured
    - _Requirements: 6.1, 6.4, 6.6, 7.1, 7.2, 7.4, 17.1, 17.5_

  - [x] 15.4 Create MbcTerminal page
    - Create `src/presentation/pages/(mbc)/MbcTerminal/index.tsx` and `mbc-terminal.module.scss`
    - Resolve `terminalController` from DI container
    - Render `NfcTapPrompt` + `FeeBreakdown` result + `BalanceDisplay` + `TransactionLogList`
    - Render manual calculation toggle + `ManualCalcForm` + manual result display
    - Display device binding error messages
    - _Requirements: 8.1, 8.9, 21.1, 21.4, 21.6_

  - [x] 15.5 Create MbcScout page
    - Create `src/presentation/pages/(mbc)/MbcScout/index.tsx` and `mbc-scout.module.scss`
    - Resolve `scoutController` from DI container
    - Render `NfcTapPrompt` + `CardInfoDisplay` with full card data
    - _Requirements: 9.1, 9.2_

- [x] 16. Routing — TanStack Router file-based routes
  - [x] 16.1 Create MBC route files
    - Create `src/routes/mbc/index.tsx` → lazy load `MbcRolePicker` page (route: `/mbc`)
    - Create `src/routes/mbc/station.tsx` → lazy load `MbcStation` page (route: `/mbc/station`)
    - Create `src/routes/mbc/gate.tsx` → lazy load `MbcGate` page (route: `/mbc/gate`)
    - Create `src/routes/mbc/terminal.tsx` → lazy load `MbcTerminal` page (route: `/mbc/terminal`)
    - Create `src/routes/mbc/scout.tsx` → lazy load `MbcScout` page (route: `/mbc/scout`)
    - Use TanStack Router `createFileRoute` with auto code-splitting
    - _Requirements: 1.1, 1.2_

- [x] 17. Checkpoint — Verify full UI integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. PWA setup — Service Worker and manifest
  - [x] 18.1 Configure PWA with vite-plugin-pwa
    - Install `vite-plugin-pwa` as a dev dependency
    - Update `vite.config.ts` to add `VitePWA` plugin with precache strategy for all assets
    - Configure cache-first strategy, no runtime API caching
    - Set scope to `/mbc` start URL
    - _Requirements: 14.3, 14.6_

  - [x] 18.2 Create or update web app manifest for MBC
    - Create or update `public/site.webmanifest` with MBC-specific fields: `name: "Membership Benefit Card"`, `short_name: "MBC"`, `start_url: "/mbc"`, `display: "standalone"`, theme colors
    - Reuse existing icons (`android-chrome-192x192.png`, `android-chrome-512x512.png`)
    - _Requirements: 14.1, 14.5_

  - [x]* 18.3 Write integration test for offline capability
    - Verify Service Worker registration and asset caching
    - Verify no external API calls during card operations
    - _Requirements: 14.2, 14.4_

- [x] 19. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at each architectural layer boundary
- Property tests validate the 10 universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error conditions
- The build order strictly follows Layer 0 → 1 → 2 → 3 → 4 → 5 → 6 to ensure no forward dependencies
- All services use the Awilix DI pattern established in the project (factory functions, `asFunction`, typed interfaces)
- Controllers follow the project's controller pattern: pure functions receiving DI, returning typed interfaces, `import type` only
- Components follow props-in/events-out pattern with zero business logic
