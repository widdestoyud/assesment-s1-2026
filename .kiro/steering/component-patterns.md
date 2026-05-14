---
inclusion: fileMatch
fileMatchPattern: "src/presentation/**/*.tsx"
---

## Component Patterns — Presentation Layer Rules

This steering covers ALL files in `src/presentation/` (pages, components, layouts).

---

## 1. Pages Are Pure Render Shells

Pages (`src/presentation/pages/`) resolve a controller from DI and render JSX. Nothing else.

### Pages Must NOT Contain

- Event handlers (`const handleX = () => { ... }`)
- Async functions (`const handleX = async () => { ... }`)
- `useState` / `useRef` / `useEffect`
- `useNavigate` or any router hook
- Data transformation, formatting, or mapping logic
- Result/status mapping functions (`getResultProps`, `getContent`, etc.)
- Computed values (`const nfcAvailable = ...`, `const maxDate = ...`)

### Pages Only Do

```tsx
const MyPage: FC = () => {
  const ctrl = container.resolve<MyControllerInterface>('myController');

  return (
    <div className={styles['my-page']}>
      <PageHeader title={ctrl.pageTitle} onBack={ctrl.onBack} />
      <MyComponent value={ctrl.someValue} onClick={ctrl.onAction} t={ctrl.t} />
    </div>
  );
};
```

### Allowed in Pages

- `container.resolve<T>('controllerName')` — resolve controller
- Destructuring: `const { t, nfcStatus } = ctrl`
- Inline value forwarding: `onChange={(e) => ctrl.onSetDate(e.target.value)}`
- CSS class conditionals using controller booleans: `className={ctrl.isActive ? styles['--active'] : ''}`
- Spread props from controller: `<Modal {...ctrl.resultProps} />`

### Where Logic Lives

| Concern | Location |
|---------|----------|
| Event handlers (onCheckIn, onTopUp) | Controller |
| Modal open/close state (showNfcModal) | Controller |
| Navigation (navigate, onBack) | Controller |
| Result/status mapping (resultProps) | Controller |
| Data formatting (formatIDR, dates) | Controller |
| Form state (topUpAmount, simulationDate) | Controller |
| Computed values (nfcAvailable, maxDate) | Controller |
| Image URLs | Controller (from `@infra/images`) |

---

## 2. Components Have Minimal Imports

Components (`src/presentation/components/`) are pure UI building blocks that receive all data through props.

### Allowed Imports in Components

| Import Source | Example | Allowed? |
|---|---|---|
| React / React hooks | `import { FC, useState } from 'react'` | ✅ Yes |
| CSS Modules (same folder) | `import styles from './my-component.module.css'` | ✅ Yes |
| Sibling components | `import { SignalButton } from '../SignalButton'` | ✅ Yes |
| Shared component types | `import type { NfcStatus } from '../types'` | ✅ Yes |

### Forbidden Imports in Components

| Import Source | Why Forbidden |
|---|---|
| `@core/...` (models, services) | Components don't know about domain |
| `@controllers/...` | Components don't know about controllers |
| `@utils/...` (helpers) | Formatting belongs in controller/page |
| `@infrastructure/...` (DI, images) | Components don't access infra |
| `@tanstack/react-router` | Navigation belongs in controller |
| `i18next` (even type-only) | Pass `t: (key: string) => string` as prop |
| `@assets/...` | Pass image URLs as string props |

### How to Fix Violations

1. **Domain types** → Define inline prop interface with only the fields needed
2. **Utility functions** (formatIDR) → Controller formats, passes string props
3. **Controller types** → Define inline interface in component
4. **Navigation** → Accept `onClose: () => void` callback prop
5. **Images** → Accept `imageSrc: string` prop
6. **TFunction** → Accept `t: (key: string) => string` prop (no i18next import)

---

## 3. Controller Interface Pattern

Controllers expose everything the page needs as flat, ready-to-render values:

```typescript
export interface GateControllerInterface {
  // Translation
  t: TFunction;

  // Page metadata
  pageTitle: string;
  onBack: () => void;

  // NFC capability
  nfcCapability: NfcCapabilityStatus;
  nfcAvailable: boolean;
  onNfcNoticeClose: () => void;
  nfcFailedImage: string;

  // NFC scan modal
  showNfcModal: boolean;
  nfcStatus: NfcStatus;
  isProcessing: boolean;
  error: string | null;
  onCloseNfcModal: () => void;
  onCancelScan: () => void;
  scanImage: string;

  // Result modal — pre-mapped, ready to spread
  resultProps: ResultModalProps | null;
  onCloseResult: () => void;

  // Actions — controller handles async + modal internally
  onCheckIn: () => void;
  onSimulationCheckIn: () => void;

  // Form state
  activeTab: 'normal' | 'simulation';
  onSetActiveTab: (tab: 'normal' | 'simulation') => void;
  simulationDate: string;
  simulationTime: string;
  maxDate: string;
  onSetSimulationDate: (date: string) => void;
  onSetSimulationTime: (time: string) => void;
}
```

---

## 4. Shared Component Types

Reusable string unions shared across components live in `src/presentation/components/types.ts`:

```typescript
export type NfcStatus = 'idle' | 'scanning' | 'reading' | 'writing' | 'verifying' | 'success' | 'error';
export type NfcCapabilityStatus = 'supported' | 'unsupported' | 'permission_pending' | 'permission_denied';
```

Components import from `'../types'` — never from `@core`.

---

## 5. Exceptions

- `src/presentation/components/SignalReact/` — Design system components may import shared design tokens
- Components may use `useState` for **local UI state only** (open/close, hover, animation) — never for business data
- Form components may import from `react-hook-form` if form-specific (prefer passing form methods as props)
