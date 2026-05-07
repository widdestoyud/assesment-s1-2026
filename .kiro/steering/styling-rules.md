---
inclusion: fileMatch
fileMatchPattern: ['**/*.tsx', '**/*.css', '**/*.module.css', 'tailwind.config.ts', 'postcss.config.ts']
---

# Styling Rules

## Core Principle

**All styling must live in CSS files using Tailwind `@apply`.** Do not write Tailwind utility classes directly in JSX `className` props. Components reference semantic CSS class names; the CSS file composes them from Tailwind utilities via `@apply`.

## Naming Convention — SMACSS + BEM (kebab-case)

All CSS class names use **kebab-case** following BEM (Block Element Modifier) methodology adapted with SMACSS categories.

### BEM Structure

```
.block {}                    /* Block: component root */
.block__element {}           /* Element: child of block */
.block--modifier {}          /* Modifier: variation of block */
.block__element--modifier {} /* Element with modifier */
```

### Block Name = Component Name (kebab-case)

The BEM block name **must match the component name** converted to kebab-case:

| Component | Block Name | CSS Module File |
|-----------|-----------|-----------------|
| `BalanceDisplay` | `balance-display` | `balance-display.module.css` |
| `FeeBreakdown` | `fee-breakdown` | `fee-breakdown.module.css` |
| `NfcTapPrompt` | `nfc-tap-prompt` | `nfc-tap-prompt.module.css` |
| `MbcStation` | `mbc-station` | `mbc-station.module.css` |
| `ServiceTypeForm` | `service-type-form` | `service-type-form.module.css` |

### Examples

```css
/* balance-display.module.css */
@reference "tailwindcss";

.balance-display {
  @apply rounded-lg bg-blue-50 p-4;
}

.balance-display__label {
  @apply text-sm text-gray-600;
}

.balance-display__amount {
  @apply text-2xl font-bold text-blue-700;
}

.balance-display__change-row {
  @apply mt-2 text-sm text-gray-500;
}

.balance-display__change--positive {
  @apply text-green-600;
}

.balance-display__change--negative {
  @apply text-red-600;
}
```

```tsx
/* BalanceDisplay/index.tsx */
import styles from './balance-display.module.css';

<div className={styles['balance-display']}>
  <p className={styles['balance-display__label']}>Saldo</p>
  <p className={styles['balance-display__amount']}>{formatIDR(balance)}</p>
  <span className={
    amount >= 0
      ? styles['balance-display__change--positive']
      : styles['balance-display__change--negative']
  }>
    {formatIDR(amount)}
  </span>
</div>
```

### SMACSS Categories

Organize classes within each CSS Module file following SMACSS order:

1. **Base** — Root element of the component (the BEM block)
2. **Layout** — Structural containers, grids, flex wrappers (`__header`, `__body`, `__footer`, `__grid`)
3. **Module** — Reusable child elements (`__label`, `__input`, `__button`, `__icon`)
4. **State** — Dynamic states (`--active`, `--disabled`, `--error`, `--success`, `--loading`)
5. **Theme** — Color/visual variations (`--primary`, `--secondary`, `--warning`)

### Naming Rules Summary

| Rule | Example | Anti-pattern |
|------|---------|-------------|
| Block = component kebab-case | `.fee-breakdown` | `.feeBreakdown`, `.FeeBreakdown` |
| Element uses `__` | `.fee-breakdown__label` | `.fee-breakdown-label`, `.feeBreakdownLabel` |
| Modifier uses `--` | `.fee-breakdown--compact` | `.fee-breakdown-compact`, `.feeBreakdownCompact` |
| Multi-word kebab-case | `.service-type-form__rate-input` | `.serviceTypeForm__rateInput` |
| State modifiers | `.nfc-tap-prompt--processing` | `.nfcTapPromptProcessing` |

## File Structure

Every component or page that needs styling must have a co-located CSS Module file:

```
src/presentation/components/mbc/FeeBreakdown/
├── index.tsx
└── fee-breakdown.module.css
```

### File Naming

| Item | Convention | Example |
|------|-----------|---------|
| CSS Module file | `kebab-case.module.css` | `fee-breakdown.module.css` |
| CSS class names | `kebab-case` with BEM `__` and `--` | `.fee-breakdown__total-row` |

## Tailwind v4 `@reference` Directive

Every CSS Module file that uses `@apply` **must** include `@reference "tailwindcss"` at the top:

```css
@reference "tailwindcss";

.nfc-tap-prompt {
  @apply flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center;
}
```

## Accessing kebab-case Classes in JSX

Since kebab-case class names contain hyphens, use bracket notation to access them from the styles object:

```tsx
import styles from './balance-display.module.css';

// Bracket notation for kebab-case
<div className={styles['balance-display']}>
<p className={styles['balance-display__label']}>Saldo</p>
```

## Conditional Styling

Define modifier classes and switch between them:

```css
.role-card {
  @apply flex w-full flex-col items-center gap-2 rounded-xl border-2 p-6 text-center transition-colors;
}

.role-card--active {
  @apply border-blue-500 bg-blue-50 shadow-md;
}

.role-card--default {
  @apply border-gray-200 bg-white;
}

.role-card--default:hover {
  @apply border-blue-300 bg-gray-50;
}
```

```tsx
<div className={`${styles['role-card']} ${isActive ? styles['role-card--active'] : styles['role-card--default']}`}>
```

## Color Conventions

| Purpose | Color Family | Example `@apply` |
|---------|-------------|-------------------|
| Primary actions | `blue` | `@apply bg-blue-600 text-white hover:bg-blue-700` |
| Success / positive | `green` | `@apply bg-green-50 text-green-700` |
| Warning / simulation | `orange` | `@apply bg-orange-50 text-orange-700` |
| Error / negative | `red` | `@apply bg-red-50 text-red-700` |
| Neutral / muted | `gray` | `@apply text-gray-500 border-gray-300` |
| Balance / financial | `blue` | `@apply bg-blue-50 text-blue-700` |

## Typography & Fonts

- **Primary font**: `Poppins` (weights: 200–700). Set globally on `html, body`.
- **Brand font**: `TelkomselBatikSans` (weights: 400, 700). Brand-specific headings only.
- Self-hosted in `src/assets/fonts/`. No external CDN links.

## Responsive Design

- Mobile-first. Use Tailwind responsive prefixes inside `@apply`:

```css
.mbc-role-picker__grid {
  @apply grid grid-cols-1 gap-4 sm:grid-cols-2;
}
```

## Global Styles

- Global styles in `src/global.css`. Keep minimal.
- Background: `#ecf3fb`. Text: `#4e5764`.
- Custom CSS properties in `:root`.

## What to Avoid

- **No Tailwind utilities in JSX `className`.** All styling via CSS Module classes with `@apply`.
- **No camelCase class names.** Use kebab-case with BEM notation.
- **No inline `style={{}}` props.**
- **No CSS-in-JS** (styled-components, Emotion).
- **No arbitrary Tailwind values** (`bg-[#ff0000]`) when a palette color exists.
- **No global CSS classes** for component-specific styles.
- **No `clsx` or `classnames` library.** Use template literals with bracket notation.
