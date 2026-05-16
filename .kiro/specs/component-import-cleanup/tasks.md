# Implementation Plan: Component Import Cleanup

## Overview

Refactor 7 presentation components to comply with the component import restriction rule. The approach is: (1) create a shared types file for NFC unions, (2) refactor each component individually to remove forbidden imports, (3) adapt caller pages to pass pre-formatted data. Each task is small and focused on a single component or concern.

## Tasks

- [x] 1. Create shared component types file
  - [x] 1.1 Create `src/presentation/components/types.ts` with NFC union types
    - Export `NfcStatus` string union: `'idle' | 'scanning' | 'reading' | 'writing' | 'verifying' | 'success' | 'error'`
    - Export `NfcCapabilityStatus` string union: `'supported' | 'unsupported' | 'permission_pending' | 'permission_denied'`
    - File must contain only `type` exports — zero runtime code
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Refactor NfcTapPrompt component
  - [x] 2.1 Replace `@src/@core/models/mbc` import with shared types import in NfcTapPrompt
    - Change `import type { NfcStatus } from '@src/@core/models/mbc'` to `import type { NfcStatus } from '../types'`
    - No other changes needed — component logic and props remain the same
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Refactor NfcScanModal component
  - [x] 3.1 Replace `@src/@core/models/mbc` import with shared types import in NfcScanModal
    - Change `import type { NfcStatus } from '@src/@core/models/mbc'` to `import type { NfcStatus } from '../types'`
    - No other changes needed — component logic and props remain the same
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 4. Refactor RoleCard component
  - [x] 4.1 Replace controller import with inline interface in RoleCard
    - Remove `import type { RoleOption } from '@controllers/mbc/role-picker.controller'`
    - Define inline `RoleCardRole` interface with: `id: string`, `labelKey: string`, `subtitleKey: string`, `descriptionKey: string`, `actionKey?: string`, `color: 'gate' | 'terminal' | 'station' | 'scout'`, `variant: 'primary' | 'secondary'`
    - Update `RoleCardProps` to use `role: RoleCardRole` instead of `role: RoleOption`
    - Export `RoleCardRole` interface for caller usage
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Refactor FeeBreakdown component
  - [x] 5.1 Replace domain model and utility imports with pre-formatted string props in FeeBreakdown
    - Remove `import type { FeeResult } from '@src/@core/models/mbc'`
    - Remove `import { formatIDR } from '@utils/helpers/mbc.helper'`
    - Replace `feeResult: FeeResult` prop with: `formattedRatePerUnit: string`, `formattedFee: string`, `usageUnits: number`, `unitLabel: string`
    - Update JSX to render pre-formatted strings directly instead of calling `formatIDR`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Refactor BalanceDisplay component
  - [x] 6.1 Replace utility import with pre-formatted string props in BalanceDisplay
    - Remove `import { formatIDR } from '@utils/helpers/mbc.helper'`
    - Replace `balance: number` with `formattedBalance: string`
    - Replace `previousBalance?: number` with `formattedPreviousBalance?: string`
    - Replace `changeAmount?: number` with `formattedChangeAmount?: string`
    - Add `isPositiveChange?: boolean` prop for styling the change amount
    - Update JSX to render pre-formatted strings and use `isPositiveChange` for conditional styling
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Refactor NfcCapabilityNotice component
  - [x] 7.1 Replace domain, navigation, and infrastructure imports with props in NfcCapabilityNotice
    - Remove `import type { NfcCapabilityStatus } from '@src/@core/models/mbc'` — import from `'../types'` instead
    - Remove `import { useNavigate } from '@tanstack/react-router'` — add `onClose: () => void` callback prop
    - Remove `import images from '@infra/images'` — add `imageSrc: string` prop
    - Remove internal `handleClose` function and `useNavigate` call
    - Pass `onClose` and `imageSrc` directly to `ResultStatusModal`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8. Refactor CardInfoDisplay component
  - [x] 8.1 Replace domain model import with inline interface in CardInfoDisplay
    - Remove `import type { CardData } from '@src/@core/models/mbc'`
    - Define inline `CardInfoProps` interface: `formattedBalance: string`, `isCheckedIn: boolean`, `formattedEntryTime?: string`
    - Replace `cardData: CardData` prop with `cardInfo: CardInfoProps`
    - Update JSX: use `cardInfo.formattedBalance` passed to BalanceDisplay, use `cardInfo.isCheckedIn` and `cardInfo.formattedEntryTime` for conditional rendering
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 9. Checkpoint - Verify all components compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Adapt caller pages
  - [x] 10.1 Adapt MbcTerminal page for BalanceDisplay new props
    - Import `formatIDR` at page level (already imported)
    - Pass `formattedBalance={formatIDR(balance)}` instead of raw `balance` number to BalanceDisplay
    - _Requirements: 9.1_

  - [x] 10.2 Adapt MbcGate page for NfcCapabilityNotice new props
    - Add `onClose` callback prop that navigates to home route: `() => navigate({ to: '/' })`
    - Add `imageSrc` prop with the NFC failed image URL from `@infra/images`
    - _Requirements: 9.3, 9.4_

  - [x] 10.3 Adapt MbcStation page for NfcCapabilityNotice new props
    - Add `onClose` callback prop that navigates to home route: `() => navigate({ to: '/' })`
    - Add `imageSrc` prop with the NFC failed image URL from `@infra/images`
    - _Requirements: 9.3, 9.4_

  - [x] 10.4 Adapt MbcScout page for NfcCapabilityNotice new props
    - Add `onClose` callback prop that navigates to home route: `() => navigate({ to: '/' })`
    - Add `imageSrc` prop with the NFC failed image URL from `@infra/images`
    - _Requirements: 9.3, 9.4_

  - [x] 10.5 Adapt MbcTerminal page for NfcCapabilityNotice new props
    - Add `onClose` callback prop that navigates to home route: `() => navigate({ to: '/' })`
    - Add `imageSrc` prop with the NFC failed image URL from `@infra/images`
    - _Requirements: 9.3, 9.4_

- [ ] 11. Final checkpoint - Verify build passes
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- No test tasks are included due to Node 18 incompatibility with the test runner
- Each component refactoring task is independent and focused on a single component
- The shared types file (task 1) must be created first as NfcTapPrompt, NfcScanModal, and NfcCapabilityNotice depend on it
- CardInfoDisplay depends on BalanceDisplay being refactored first (task 6 before task 8)
- Pages already import `formatIDR` and `useNavigate` — the adaptation moves formatting calls from component to page level
- RoleCard is not currently used in any page, so no caller-side adaptation is needed for it

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "5.1"] },
    { "id": 2, "tasks": ["6.1", "7.1"] },
    { "id": 3, "tasks": ["8.1"] },
    { "id": 4, "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5"] }
  ]
}
```
