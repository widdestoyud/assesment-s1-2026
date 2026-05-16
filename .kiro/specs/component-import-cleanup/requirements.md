# Requirements Document

## Introduction

Refactor 7 presentation components under `src/presentation/components/` to comply with the component import restriction rule. Components must not import from `@core`, `@controllers`, `@utils`, `@infra`, or navigation libraries. All domain types, formatting logic, and infrastructure dependencies are replaced with inline prop interfaces, pre-formatted string props, and callback props. A shared component-layer types file is introduced for NFC status unions reused across multiple components.

## Glossary

- **Component**: A React functional component located in `src/presentation/components/` that renders UI based solely on props.
- **Component_Import_Rule**: The architectural constraint that presentation components may only import from React, CSS Modules (same folder), sibling components, and `i18next` type-only imports.
- **Shared_Types_File**: The file at `src/presentation/components/types.ts` that exports string union types shared across multiple presentation components.
- **Controller**: A function in `src/presentation/controllers/` responsible for calling services, formatting data, and exposing view-ready state.
- **Page**: A view component in `src/presentation/pages/` that resolves a controller and maps controller state to component props.
- **Refactored_Component**: A presentation component that has been updated to remove all forbidden imports and receive data exclusively through props.

## Requirements

### Requirement 1: Shared Component Types File

**User Story:** As a developer, I want NFC-related string unions defined in a shared component-layer types file, so that multiple components can reference them without importing from `@core`.

#### Acceptance Criteria

1. THE Shared_Types_File SHALL export a `NfcStatus` string union type with values `'idle' | 'scanning' | 'reading' | 'writing' | 'verifying' | 'success' | 'error'`.
2. THE Shared_Types_File SHALL export a `NfcCapabilityStatus` string union type with values `'supported' | 'unsupported' | 'permission_pending' | 'permission_denied'`.
3. THE Shared_Types_File SHALL be located at `src/presentation/components/types.ts`.
4. THE Shared_Types_File SHALL contain only type definitions and no runtime code.

### Requirement 2: RoleCard Import Cleanup

**User Story:** As a developer, I want RoleCard to define its own prop shape inline, so that it does not import `RoleOption` from `@controllers`.

#### Acceptance Criteria

1. WHEN refactored, THE Refactored_Component (RoleCard) SHALL define a `RoleCardRole` interface inline within its props file containing properties: `id: string`, `labelKey: string`, `subtitleKey: string`, `descriptionKey: string`, `actionKey?: string`, `color: 'gate' | 'terminal' | 'station' | 'scout'`, and `variant: 'primary' | 'secondary'`.
2. WHEN refactored, THE Refactored_Component (RoleCard) SHALL accept a `role` prop typed with the inline `RoleCardRole` interface instead of the imported `RoleOption` type.
3. WHEN refactored, THE Refactored_Component (RoleCard) SHALL have zero imports from `@controllers`.
4. WHEN refactored, THE Refactored_Component (RoleCard) SHALL render identically to its current behavior given the same data.

### Requirement 3: FeeBreakdown Import Cleanup

**User Story:** As a developer, I want FeeBreakdown to receive pre-formatted strings as props, so that it does not import `FeeResult` from `@core` or `formatIDR` from `@utils`.

#### Acceptance Criteria

1. WHEN refactored, THE Refactored_Component (FeeBreakdown) SHALL accept pre-formatted string props: `formattedRatePerUnit: string` and `formattedFee: string`.
2. WHEN refactored, THE Refactored_Component (FeeBreakdown) SHALL accept primitive props `usageUnits: number` and `unitLabel: string` for non-formatted display values.
3. WHEN refactored, THE Refactored_Component (FeeBreakdown) SHALL have zero imports from `@core` or `@utils`.
4. WHEN refactored, THE Refactored_Component (FeeBreakdown) SHALL render identically to its current behavior when the Page or Controller passes equivalent pre-formatted values.

### Requirement 4: BalanceDisplay Import Cleanup

**User Story:** As a developer, I want BalanceDisplay to receive pre-formatted currency strings as props, so that it does not import `formatIDR` from `@utils`.

#### Acceptance Criteria

1. WHEN refactored, THE Refactored_Component (BalanceDisplay) SHALL accept `formattedBalance: string` as a prop instead of a raw `balance: number`.
2. WHEN refactored, THE Refactored_Component (BalanceDisplay) SHALL accept optional `formattedPreviousBalance?: string` and `formattedChangeAmount?: string` props for the change row display.
3. WHEN refactored, THE Refactored_Component (BalanceDisplay) SHALL accept an optional `isPositiveChange?: boolean` prop to determine the styling of the change amount.
4. WHEN refactored, THE Refactored_Component (BalanceDisplay) SHALL have zero imports from `@utils`.
5. WHEN refactored, THE Refactored_Component (BalanceDisplay) SHALL render identically to its current behavior when the Page or Controller passes equivalent pre-formatted values.

### Requirement 5: NfcTapPrompt Import Cleanup

**User Story:** As a developer, I want NfcTapPrompt to reference `NfcStatus` from the shared component types file, so that it does not import from `@core`.

#### Acceptance Criteria

1. WHEN refactored, THE Refactored_Component (NfcTapPrompt) SHALL import `NfcStatus` from the Shared_Types_File at `src/presentation/components/types.ts`.
2. WHEN refactored, THE Refactored_Component (NfcTapPrompt) SHALL have zero imports from `@core`.
3. WHEN refactored, THE Refactored_Component (NfcTapPrompt) SHALL render identically to its current behavior given the same props.

### Requirement 6: NfcScanModal Import Cleanup

**User Story:** As a developer, I want NfcScanModal to reference `NfcStatus` from the shared component types file, so that it does not import from `@core`.

#### Acceptance Criteria

1. WHEN refactored, THE Refactored_Component (NfcScanModal) SHALL import `NfcStatus` from the Shared_Types_File at `src/presentation/components/types.ts`.
2. WHEN refactored, THE Refactored_Component (NfcScanModal) SHALL have zero imports from `@core`.
3. WHEN refactored, THE Refactored_Component (NfcScanModal) SHALL render identically to its current behavior given the same props.

### Requirement 7: NfcCapabilityNotice Import Cleanup

**User Story:** As a developer, I want NfcCapabilityNotice to be a pure presentational component that receives all behavior and assets through props, so that it does not import from `@core`, `@tanstack/react-router`, or `@infra`.

#### Acceptance Criteria

1. WHEN refactored, THE Refactored_Component (NfcCapabilityNotice) SHALL import `NfcCapabilityStatus` from the Shared_Types_File at `src/presentation/components/types.ts`.
2. WHEN refactored, THE Refactored_Component (NfcCapabilityNotice) SHALL accept an `onClose: () => void` callback prop instead of using `useNavigate` internally.
3. WHEN refactored, THE Refactored_Component (NfcCapabilityNotice) SHALL accept an `imageSrc: string` prop instead of importing images from `@infra/images`.
4. WHEN refactored, THE Refactored_Component (NfcCapabilityNotice) SHALL have zero imports from `@core`, `@tanstack/react-router`, or `@infra`.
5. WHEN refactored, THE Refactored_Component (NfcCapabilityNotice) SHALL render identically to its current behavior when the Page passes the equivalent `onClose` handler and `imageSrc` value.

### Requirement 8: CardInfoDisplay Import Cleanup

**User Story:** As a developer, I want CardInfoDisplay to define its own inline prop shape, so that it does not import `CardData` from `@core`.

#### Acceptance Criteria

1. WHEN refactored, THE Refactored_Component (CardInfoDisplay) SHALL define an inline interface for its card data prop containing only the fields it uses: `balance: string` (pre-formatted), `isCheckedIn: boolean`, and `formattedEntryTime?: string`.
2. WHEN refactored, THE Refactored_Component (CardInfoDisplay) SHALL have zero imports from `@core`.
3. WHEN refactored, THE Refactored_Component (CardInfoDisplay) SHALL render identically to its current behavior when the Page passes equivalent mapped values.

### Requirement 9: Caller-Side Adaptation

**User Story:** As a developer, I want pages and controllers that use the refactored components to pass the correct prop shapes, so that the application continues to function after the refactoring.

#### Acceptance Criteria

1. WHEN a Page renders BalanceDisplay, THE Page SHALL call `formatIDR` and pass the result as `formattedBalance` string prop.
2. WHEN a Page renders FeeBreakdown, THE Page SHALL call `formatIDR` for rate and fee values and pass results as `formattedRatePerUnit` and `formattedFee` string props.
3. WHEN a Page renders NfcCapabilityNotice, THE Page SHALL pass an `onClose` callback that navigates to the home route.
4. WHEN a Page renders NfcCapabilityNotice, THE Page SHALL pass the NFC failed image URL as the `imageSrc` string prop.
5. WHEN a Page renders CardInfoDisplay, THE Page SHALL map `CardData` fields to the inline prop shape, including pre-formatting the balance and entry time.
6. WHEN a Page renders RoleCard, THE Page SHALL pass the role data conforming to the inline `RoleCardRole` interface.
