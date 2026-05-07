## Internationalization (i18n)

### Setup

- **i18next** with browser language detection and WCMS backend.
- `useTranslation` is registered in the Awilix DI container (`libraryContainer.ts`).
- Local fallback translations in `src/translation/locale/` (`id.ts` and `en.ts`).
- Translations are cached via TanStack Query.

### Architecture Pattern

Translation follows the Clean Architecture layer separation:

1. **DI Container** — `useTranslation` is registered as a dependency in `libraryContainer.ts`.
2. **Controller** — Injects `useTranslation` via deps, calls `const { t } = useTranslation()`, and exposes `t: TFunction` in its return interface.
3. **Page (View)** — Gets `t` from the controller (`const { t } = ctrl`), uses `t('key')` for its own text, and passes `t` as a prop to child components.
4. **Child Component** — Receives `t: TFunction` as a prop. Never calls `useTranslation()` directly.

**Presentation layer (pages and components) must NEVER import `useTranslation` from `react-i18next` directly.**

### Usage in Controllers

```typescript
import type { TFunction } from 'i18next';

export interface MyControllerInterface {
  // ... other fields
  t: TFunction;
}

const MyController = (
  deps: Pick<AwilixRegistry, 'useState' | 'useTranslation' | /* ... */>,
): MyControllerInterface => {
  const { useState, useTranslation } = deps;
  const { t } = useTranslation();

  // Use in Zod validation messages
  const schema = zod.string().length(16, t('web_input_failed_nik_number_text'));

  return {
    // ... other fields
    t,
  };
};
```

### Usage in Pages (Views)

```typescript
// ✅ Correct — get t from controller
const MyPage: FC = () => {
  const ctrl = container.resolve<MyControllerInterface>('myController');
  const { t } = ctrl;

  return (
    <main>
      <h1>{t('my_page_title')}</h1>
      <MyChildComponent label={t('my_label')} t={t} />
    </main>
  );
};
```

```typescript
// ❌ Wrong — never import useTranslation in presentation
import { useTranslation } from 'react-i18next';
const { t } = useTranslation(); // FORBIDDEN in pages/components
```

### Usage in Child Components

```typescript
import type { TFunction } from 'i18next';

export interface MyComponentProps {
  // ... other props
  t: TFunction;
}

const MyComponent: FC<MyComponentProps> = ({ t, /* ... */ }) => {
  return <p>{t('my_component_label')}</p>;
};
```

### Translation Key Naming Convention

Keys follow the pattern: `{module}_{context}_{description}`

```
mbc_gate_title              — MBC Gate page title
mbc_station_tab_register    — MBC Station registration tab label
mbc_nfc_status_idle         — NFC tap prompt idle status text
mbc_error_not_registered    — MBC error: card not registered
mbc_benefit_form_rate_label — Benefit type form rate label
```

### Rules

- Always use translation keys, never hardcoded strings in UI.
- `useTranslation` is injected via Awilix DI, never imported directly in presentation.
- Controllers expose `t: TFunction` in their interface.
- Child components receive `t` as a prop (`t: TFunction`).
- Provide local fallback translations for offline/error scenarios.
- Normalize language codes with `normalizeLang()` before use.
- Support only `id` and `en` — default to `id` for unknown languages.
- Both `id.ts` and `en.ts` must have identical keys.
- Use `import type { TFunction } from 'i18next'` for typing `t`.

---
