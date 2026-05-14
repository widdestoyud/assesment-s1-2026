# Design Document

## Overview

This document describes the architecture and implementation design for refactoring 7 presentation components to comply with the component import restriction rule. The refactoring introduces a shared component-layer types file, replaces domain model imports with inline interfaces, replaces utility function calls with pre-formatted string props, and replaces infrastructure/navigation imports with callback and string props.

## Architecture

The refactoring operates within the existing Clean Architecture 5-layer structure. Changes are confined to:

1. **Layer 5 (Presentation — Components)**: Remove forbidden imports, define inline prop interfaces, import shared types from the new component-layer types file.
2. **Layer 5 (Presentation — Pages)**: Adapt prop-passing to supply pre-formatted strings, callbacks, and mapped data.
3. **Layer 4 (Controllers)**: No changes required — controllers already expose formatted data or can be extended to do so.

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation Layer                                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  src/presentation/components/types.ts               │   │
│  │  (NfcStatus, NfcCapabilityStatus unions)            │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │ imports                           │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │  Components (NfcScanModal, NfcTapPrompt,            │   │
│  │  NfcCapabilityNotice, RoleCard, FeeBreakdown,       │   │
│  │  BalanceDisplay, CardInfoDisplay)                    │   │
│  └──────────────────────▲──────────────────────────────┘   │
│                         │ renders with props                │
│  ┌──────────────────────┴──────────────────────────────┐   │
│  │  Pages (pass pre-formatted strings, callbacks,      │   │
│  │  imageSrc, mapped inline data)                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Shared Types File (`src/presentation/components/types.ts`)

A single file exporting NFC-related string union types shared across multiple presentation components. Contains only `type` exports — zero runtime code.

```typescript
/**
 * NFC operation status used by NfcScanModal and NfcTapPrompt.
 */
export type NfcStatus =
  | 'idle'
  | 'scanning'
  | 'reading'
  | 'writing'
  | 'verifying'
  | 'success'
  | 'error';

/**
 * NFC hardware capability status used by NfcCapabilityNotice.
 */
export type NfcCapabilityStatus =
  | 'supported'
  | 'unsupported'
  | 'permission_pending'
  | 'permission_denied';
```

### 2. RoleCard (Inline Interface)

Replaces `import type { RoleOption } from '@controllers/mbc/role-picker.controller'` with an inline `RoleCardRole` interface.

```typescript
import type { FC } from 'react';
import type { TFunction } from 'i18next';
import styles from './role-card.module.css';

export interface RoleCardRole {
  id: string;
  labelKey: string;
  subtitleKey: string;
  descriptionKey: string;
  actionKey?: string;
  color: 'gate' | 'terminal' | 'station' | 'scout';
  variant: 'primary' | 'secondary';
}

export interface RoleCardProps {
  role: RoleCardRole;
  isActive: boolean;
  onSelect: () => void;
  t: TFunction;
}

const RoleCard: FC<RoleCardProps> = ({ role, onSelect, t }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={`role-card-${role.id}`}
      className={`${styles['role-card']} ${styles[`role-card--${role.color}`]}`}
    >
      <h3 className={`${styles['role-card__label']} ${styles[`role-card__label--${role.color}`]}`}>
        {String(t(role.labelKey as never))}
      </h3>
      <p className={styles['role-card__description']}>
        {String(t(role.descriptionKey as never))}
      </p>
    </button>
  );
};

export default RoleCard;
```

### 3. FeeBreakdown (Pre-formatted String Props)

Replaces `import type { FeeResult } from '@src/@core/models/mbc'` and `import { formatIDR } from '@utils/helpers/mbc.helper'` with pre-formatted string props.

```typescript
import type { FC } from 'react';
import type { TFunction } from 'i18next';
import styles from './fee-breakdown.module.css';

export interface FeeBreakdownProps {
  formattedRatePerUnit: string;
  formattedFee: string;
  usageUnits: number;
  unitLabel: string;
  benefitTypeName: string;
  t: TFunction;
}

const FeeBreakdown: FC<FeeBreakdownProps> = ({
  formattedRatePerUnit,
  formattedFee,
  usageUnits,
  unitLabel,
  benefitTypeName,
  t,
}) => {
  return (
    <div data-testid="fee-breakdown" className={styles['fee-breakdown']}>
      <h3 className={styles['fee-breakdown__title']}>{t('mbc_fee_title')}</h3>
      <dl className={styles['fee-breakdown__list']}>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>{t('mbc_fee_service_label')}</dt>
          <dd className={styles['fee-breakdown__value']}>{benefitTypeName}</dd>
        </div>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>{t('mbc_terminal_duration_label')}</dt>
          <dd className={styles['fee-breakdown__value']}>
            {usageUnits} {unitLabel}
          </dd>
        </div>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>{t('mbc_fee_rate_label')}</dt>
          <dd className={styles['fee-breakdown__value']}>
            {formattedRatePerUnit} / {unitLabel}
          </dd>
        </div>
        <div className={styles['fee-breakdown__total-row']}>
          <dt>{t('mbc_fee_total_label')}</dt>
          <dd>{formattedFee}</dd>
        </div>
      </dl>
    </div>
  );
};

export default FeeBreakdown;
```

### 4. BalanceDisplay (Pre-formatted String Props)

Replaces `import { formatIDR } from '@utils/helpers/mbc.helper'` with pre-formatted string props.

```typescript
import type { FC } from 'react';
import type { TFunction } from 'i18next';
import styles from './balance-display.module.css';

export interface BalanceDisplayProps {
  formattedBalance: string;
  formattedPreviousBalance?: string;
  formattedChangeAmount?: string;
  isPositiveChange?: boolean;
  t: TFunction;
}

const BalanceDisplay: FC<BalanceDisplayProps> = ({
  formattedBalance,
  formattedPreviousBalance,
  formattedChangeAmount,
  isPositiveChange,
  t,
}) => {
  return (
    <div data-testid="balance-display" className={styles['balance-display']}>
      <p className={styles['balance-display__label']}>{t('mbc_balance_label')}</p>
      <p className={styles['balance-display__amount']}>{formattedBalance}</p>
      {formattedPreviousBalance !== undefined && formattedChangeAmount !== undefined && (
        <div className={styles['balance-display__change-row']}>
          <span>{formattedPreviousBalance}</span>
          <span className={isPositiveChange ? styles['balance-display__change--positive'] : styles['balance-display__change--negative']}>
            {' '}
            {isPositiveChange ? '+' : ''}
            {formattedChangeAmount}
          </span>
        </div>
      )}
    </div>
  );
};

export default BalanceDisplay;
```

### 5. NfcTapPrompt (Shared Types Import)

Replaces `import type { NfcStatus } from '@src/@core/models/mbc'` with import from the shared types file.

```typescript
import type { FC } from 'react';
import type { TFunction } from 'i18next';
import type { NfcStatus } from '../types';
import styles from './nfc-tap-prompt.module.css';

// Rest of component unchanged — only the import source changes.
```

### 6. NfcScanModal (Shared Types Import)

Replaces `import type { NfcStatus } from '@src/@core/models/mbc'` with import from the shared types file.

```typescript
import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { TFunction } from 'i18next';
import type { NfcStatus } from '../types';
import styles from './nfc-scan-modal.module.css';

// Rest of component unchanged — only the import source changes.
```

### 7. NfcCapabilityNotice (Callback + Image Props)

Replaces `import type { NfcCapabilityStatus } from '@src/@core/models/mbc'`, `import { useNavigate } from '@tanstack/react-router'`, and `import images from '@infra/images'` with props.

```typescript
import type { FC } from 'react';
import type { TFunction } from 'i18next';
import type { NfcCapabilityStatus } from '../types';
import ResultStatusModal from '@components/ResultStatusModal';

export interface NfcCapabilityNoticeProps {
  status: NfcCapabilityStatus;
  onClose: () => void;
  imageSrc: string;
  t: TFunction;
}

const NfcCapabilityNotice: FC<NfcCapabilityNoticeProps> = ({ status, onClose, imageSrc, t }) => {
  if (status === 'supported') return null;

  const getContent = () => {
    switch (status) {
      case 'unsupported':
        return {
          title: t('mbc_nfc_unsupported_title'),
          message: t('mbc_nfc_unsupported_message'),
        };
      case 'permission_pending':
        return {
          title: t('mbc_nfc_permission_pending_title'),
          message: t('mbc_nfc_permission_pending_message'),
        };
      case 'permission_denied':
        return {
          title: t('mbc_nfc_permission_denied_title'),
          message: t('mbc_nfc_permission_denied_message'),
        };
    }
  };

  const content = getContent();

  return (
    <ResultStatusModal
      isOpen={true}
      variant="error"
      title={content.title}
      subtitle={content.message}
      buttonLabel={t('app_popup_close_button_label')}
      imageSrc={imageSrc}
      onClose={onClose}
    />
  );
};

export default NfcCapabilityNotice;
```

### 8. CardInfoDisplay (Inline Interface)

Replaces `import type { CardData } from '@src/@core/models/mbc'` with an inline interface containing only the fields the component uses.

```typescript
import type { FC } from 'react';
import type { TFunction } from 'i18next';
import BalanceDisplay from '@components/BalanceDisplay';
import styles from './card-info-display.module.css';

export interface CardInfoProps {
  formattedBalance: string;
  isCheckedIn: boolean;
  formattedEntryTime?: string;
}

export interface CardInfoDisplayProps {
  cardInfo: CardInfoProps;
  t: TFunction;
}

const CardInfoDisplay: FC<CardInfoDisplayProps> = ({ cardInfo, t }) => {
  return (
    <div data-testid="card-info-display" className={styles['card-info-display']}>
      <BalanceDisplay formattedBalance={cardInfo.formattedBalance} t={t} />

      {cardInfo.isCheckedIn && cardInfo.formattedEntryTime && (
        <div className={styles['card-info-display__check-in-card']}>
          <h3 className={styles['card-info-display__check-in-label']}>
            {t('mbc_card_checkin_active')}
          </h3>
          <p className={styles['card-info-display__check-in-detail']}>
            {t('mbc_common_entry_time_label')}{' '}
            <strong>{cardInfo.formattedEntryTime}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default CardInfoDisplay;
```

## Interfaces

### Shared Types File Exports

| Export | Type | Consumers |
|--------|------|-----------|
| `NfcStatus` | String union | NfcScanModal, NfcTapPrompt |
| `NfcCapabilityStatus` | String union | NfcCapabilityNotice |

### Component Props Interfaces (After Refactoring)

| Component | Props Interface | Key Changes |
|-----------|----------------|-------------|
| RoleCard | `RoleCardProps` | `role: RoleCardRole` (inline) replaces `role: RoleOption` (from controller) |
| FeeBreakdown | `FeeBreakdownProps` | `formattedRatePerUnit`, `formattedFee` strings replace `feeResult: FeeResult` + `formatIDR` |
| BalanceDisplay | `BalanceDisplayProps` | `formattedBalance` string replaces `balance: number` + `formatIDR` |
| NfcTapPrompt | `NfcTapPromptProps` | Import source changes from `@core` to `../types` |
| NfcScanModal | `NfcScanModalProps` | Import source changes from `@core` to `../types` |
| NfcCapabilityNotice | `NfcCapabilityNoticeProps` | Adds `onClose`, `imageSrc` props; removes `useNavigate`, `images` imports |
| CardInfoDisplay | `CardInfoDisplayProps` | `cardInfo: CardInfoProps` (inline) replaces `cardData: CardData` |

## Data Models

### RoleCardRole (Inline in RoleCard)

```typescript
export interface RoleCardRole {
  id: string;
  labelKey: string;
  subtitleKey: string;
  descriptionKey: string;
  actionKey?: string;
  color: 'gate' | 'terminal' | 'station' | 'scout';
  variant: 'primary' | 'secondary';
}
```

### CardInfoProps (Inline in CardInfoDisplay)

```typescript
export interface CardInfoProps {
  formattedBalance: string;
  isCheckedIn: boolean;
  formattedEntryTime?: string;
}
```

## Error Handling

No new error handling is introduced. The refactoring preserves existing component behavior:

- **NfcCapabilityNotice**: The `getContent()` switch handles all non-`'supported'` statuses exhaustively. TypeScript's exhaustive check ensures no status is missed.
- **BalanceDisplay**: Optional props (`formattedPreviousBalance`, `formattedChangeAmount`) use `!== undefined` guards before rendering the change row.
- **CardInfoDisplay**: Conditional rendering uses `isCheckedIn && formattedEntryTime` guard.

## Caller-Side Adaptation Pattern

Pages adapt by calling `formatIDR` at the page level and passing results as string props:

```typescript
// Example: Page rendering FeeBreakdown
const { feeResult, benefitTypeName, t } = ctrl;

<FeeBreakdown
  formattedRatePerUnit={formatIDR(feeResult.ratePerUnit)}
  formattedFee={formatIDR(feeResult.fee)}
  usageUnits={feeResult.usageUnits}
  unitLabel={feeResult.unitLabel}
  benefitTypeName={benefitTypeName}
  t={t}
/>
```

```typescript
// Example: Page rendering NfcCapabilityNotice
const navigate = useNavigate();

<NfcCapabilityNotice
  status={ctrl.nfcCapability}
  onClose={() => navigate({ to: '/' })}
  imageSrc={images.nfcFailed}
  t={ctrl.t}
/>
```

```typescript
// Example: Page rendering CardInfoDisplay
<CardInfoDisplay
  cardInfo={{
    formattedBalance: formatIDR(cardData.b),
    isCheckedIn: cardData.s === 1,
    formattedEntryTime: cardData.t
      ? new Date(cardData.t).toLocaleString('id-ID')
      : undefined,
  }}
  t={ctrl.t}
/>
```

## Testing Strategy

### Unit Tests (Example-Based)

Each refactored component gets a unit test verifying:
- Renders correctly with the new prop interface (snapshot or assertion-based)
- Conditional rendering works (e.g., BalanceDisplay change row, CardInfoDisplay check-in card)
- Callback props are invoked correctly (e.g., NfcCapabilityNotice onClose)

### Property Tests

- **Forbidden import scanning**: Validate all 7 component files have zero forbidden imports using AST or regex scanning across generated import path variations.
- **Pre-formatted value passthrough**: Validate FeeBreakdown and BalanceDisplay render string props verbatim without transformation.

### Integration Tests

- Page-level tests verify that pages correctly map domain data to component props (formatIDR calls, CardData mapping, navigation callbacks).

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: No forbidden imports in refactored components

*For any* refactored component file in `src/presentation/components/`, scanning its import statements shall yield zero matches for the forbidden import patterns: `@core`, `@src/@core`, `@controllers`, `@utils`, `@infra`, and `@tanstack/react-router`.

**Validates: Requirements 2.3, 3.3, 4.4, 5.2, 6.2, 7.4, 8.2**

### Property 2: Shared types file contains only type-level exports

*For any* export in `src/presentation/components/types.ts`, the export shall be a `type` or `interface` declaration — never a `const`, `let`, `function`, or `class` declaration that produces runtime code.

**Validates: Requirements 1.4**

### Property 3: NfcCapabilityNotice delegates close behavior to caller

*For any* `NfcCapabilityStatus` value other than `'supported'`, rendering NfcCapabilityNotice and triggering the close action shall invoke the `onClose` callback prop exactly once, without performing any navigation internally.

**Validates: Requirements 7.2**

### Property 4: BalanceDisplay change-row visibility is controlled by optional props

*For any* combination of `formattedPreviousBalance` and `formattedChangeAmount` props, the change row is rendered if and only if both props are defined (not `undefined`).

**Validates: Requirements 4.2, 4.3**

### Property 5: FeeBreakdown renders pre-formatted values verbatim

*For any* `formattedRatePerUnit` and `formattedFee` string values passed as props, the rendered output shall contain those exact strings without transformation.

**Validates: Requirements 3.1, 3.4**
