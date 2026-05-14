---
inclusion: fileMatch
fileMatchPattern: "src/presentation/components/**/*.tsx"
---

## Component Import Restrictions

### Rule

Presentation components (`src/presentation/components/`) must have **minimal import dependencies**. They are pure UI building blocks that receive all data and behavior through props.

### Allowed Imports

| Import Source | Example | Allowed? |
|---|---|---|
| React / React hooks | `import { FC, useState } from 'react'` | ✅ Yes |
| CSS Modules (same folder) | `import styles from './my-component.module.css'` | ✅ Yes |
| Sibling components | `import { SignalButton } from '../SignalButton'` | ✅ Yes |
| i18next types only | `import type { TFunction } from 'i18next'` | ✅ Yes |
| React types | `import type { ReactNode, CSSProperties } from 'react'` | ✅ Yes |

### Forbidden Imports

| Import Source | Example | Why Forbidden |
|---|---|---|
| Controllers | `import type { RoleOption } from '@controllers/mbc/...'` | Components don't know about controllers |
| Models / Domain | `import type { CardData, BenefitType } from '@core/...'` | Components don't know about domain models |
| Services | `import { formatIDR } from '@utils/helpers/mbc.helper'` | Utility logic belongs in controller or page |
| Use Cases | `import { CheckInUseCase } from '@core/use_case/...'` | Components never call use cases |
| Infrastructure | `import { container } from '@di/container'` | Components never access DI container |
| Protocols | `import type { NfcProtocol } from '@core/protocols/...'` | Components don't know about protocols |
| Assets directly | `import nfcImage from '@assets/images/...'` | Pass image URLs as props from page |

### How to Fix Violations

When a component imports from a forbidden source, refactor by:

1. **Extract the type into the component's own Props interface** — define the shape the component needs inline
2. **Move formatting logic to the page or controller** — pass pre-formatted strings as props
3. **Pass data as primitive props** — instead of `BenefitType`, pass `{ id: string; name: string; rate: number }`

### Examples

```tsx
// ❌ WRONG — component imports domain model and utility
import type { BenefitType } from '@core/services/mbc/models';
import { formatIDR } from '@utils/helpers/mbc.helper';

interface Props {
  benefitType: BenefitType;
}

const BenefitCard: FC<Props> = ({ benefitType }) => (
  <div>{formatIDR(benefitType.pricing.ratePerUnit)}</div>
);
```

```tsx
// ✅ CORRECT — component receives pre-formatted data as props
interface BenefitCardProps {
  name: string;
  formattedRate: string;
}

const BenefitCard: FC<BenefitCardProps> = ({ name, formattedRate }) => (
  <div>{formattedRate}</div>
);
```

### Where Formatting and Domain Logic Lives

| Layer | Responsibility |
|---|---|
| **Controller** | Calls services, formats data, exposes view-ready state |
| **Page** | Resolves controller, maps controller state to component props |
| **Component** | Renders props. No logic beyond local UI state (open/close, hover) |

### Exceptions

- `src/presentation/components/SignalReact/` — Design system components may import shared design tokens
- Components may import from `react-hook-form` if they are form-specific (but prefer passing form methods as props)
