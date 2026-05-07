# Tasks: MBC Slim Storage Architecture

## Task 1: Update Data Model (Layer 1 — Core)

- [ ] 1.1 Buat `CardDataV2` interface dan Zod schema di `src/@core/services/mbc/models.ts`
- [ ] 1.2 Tambah `PARKING_CONFIG` hardcoded constant
- [ ] 1.3 Hapus/deprecate: `MemberIdentity`, `TransactionLogEntry`, `CheckInDetail`, `BenefitType` dynamic model
- [ ] 1.4 Update `CardData` type alias ke `CardDataV2`

## Task 2: Rewrite card-data.service (Layer 2 — Services)

- [ ] 2.1 Rewrite `serialize()`: CardDataV2 → JSON string → Uint8Array (TextEncoder)
- [ ] 2.2 Rewrite `deserialize()`: Uint8Array → TextDecoder → JSON.parse → Zod validate
- [ ] 2.3 Implement `createBlank()`: return `{v:2, b:0, s:0, t:null}`
- [ ] 2.4 Rewrite `applyTopUp(card, amount)`: return new card with `b += amount`
- [ ] 2.5 Implement `applyCheckIn(card, timestamp)`: validate `s===0`, return `{...card, s:1, t:timestamp}`
- [ ] 2.6 Implement `applyCheckOut(card, fee)`: validate `s===1`, return `{...card, s:0, t:null, b: b-fee}`
- [ ] 2.7 Hapus: `applyRegistration`, `appendTransactionLog`, `validate` (Zod handles it)

## Task 3: Rewrite Use Cases (Layer 3)

- [ ] 3.1 Buat `ValidateCard` use case (replaces RegisterMember)
- [ ] 3.2 Rewrite `TopUpBalance` — gunakan readThenWrite, no member validation
- [ ] 3.3 Rewrite `CheckIn` — no device binding, no benefit type param, hardcoded parking
- [ ] 3.4 Rewrite `CheckOut` — hardcoded PARKING_CONFIG, no device validation
- [ ] 3.5 Simplify `ReadCard` — just decrypt + deserialize, no member validation
- [ ] 3.6 Hapus: `RegisterMember`, `ManageBenefitRegistry`, `ManualCalculation`

## Task 4: Update Controllers (Layer 4)

- [ ] 4.1 Rewrite `StationController` — phase-based: tap → topup/balance
- [ ] 4.2 Simplify `GateController` — remove benefit type selector, simulation mode
- [ ] 4.3 Simplify `TerminalController` — remove manual calc, simplify checkout
- [ ] 4.4 Simplify `ScoutController` — display CardDataV2 fields
- [ ] 4.5 Simplify `RolePickerController` — update descriptions

## Task 5: Update Presentation (Layer 5)

- [ ] 5.1 Redesign `MbcStation` page — tap-first flow with phases
- [ ] 5.2 Simplify `MbcGate` page — remove BenefitTypeSelector, SimulationBanner
- [ ] 5.3 Simplify `MbcTerminal` page — remove ManualCalcForm
- [ ] 5.4 Simplify `MbcScout` page — display v2 card data
- [ ] 5.5 Update/remove unused components: BenefitTypeSelector, BenefitTypeForm, SimulationBanner, ManualCalcForm
- [ ] 5.6 Update CardInfoDisplay for v2 format
- [ ] 5.7 Keep DebugPanel for testing

## Task 6: Update DI Container

- [ ] 6.1 Remove registrations: benefitRegistryService, deviceService, storageHealthService, manageBenefitRegistryUseCase, registerMemberUseCase, manualCalculationUseCase
- [ ] 6.2 Add registration: validateCardUseCase
- [ ] 6.3 Update AwilixRegistry type

## Task 7: Update Tests

- [ ] 7.1 Rewrite card-data.service tests for v2 format
- [ ] 7.2 Rewrite use case tests (ValidateCard, TopUp, CheckIn, CheckOut, ReadCard)
- [ ] 7.3 Update controller tests
- [ ] 7.4 Remove tests for deleted modules

## Task 8: Update i18n

- [ ] 8.1 Add new translation keys for Station phases
- [ ] 8.2 Remove unused translation keys (member identity, benefit type config, etc.)

## Task 9: Cleanup

- [ ] 9.1 Delete unused service files (benefit-registry, device, storage-health)
- [ ] 9.2 Delete unused use case files (RegisterMember, ManageBenefitRegistry, ManualCalculation)
- [ ] 9.3 Delete unused component files (BenefitTypeSelector, BenefitTypeForm, SimulationBanner, ManualCalcForm)
- [ ] 9.4 Run build + test — ensure 0 errors

## Task 10: Update Documentation

- [ ] 10.1 Update wiki: Clean-Architecture.md, Data-Flow.md
- [ ] 10.2 Update wiki: Card-Data-Schema.md (v2 format)
- [ ] 10.3 Update wiki: Business flows (Check-In, Check-Out, Top-Up, Registration)
- [ ] 10.4 Update wiki: Home.md diagram
- [ ] 10.5 Remove wiki pages for deleted features (Benefit Type Configuration, Manual Calculation)
