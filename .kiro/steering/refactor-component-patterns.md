---
description: Refactor React components into controller+view pattern with accessibility, typed props, and SCSS modules
inclusion: manual
---

# Skill: Refactor Component Patterns

Refactor React components to follow standardized patterns for consistency, accessibility, and testability.

## When to Use

- Standardizing component structure across a project.
- Adding accessibility and proper prop typing to existing components.
- Splitting monolithic components into controller + view pattern.

## Component File Structure

Each component gets its own folder:

```
ComponentName/
├── index.tsx                    # Component implementation
└── component-name.module.scss   # Scoped styles (kebab-case)
```

## Page Component Pattern

Pages should be thin wrappers that resolve a controller and render:

```typescript
import { FC } from 'react';
import awilix from '@di/container';
import type { PageInterface } from '@controllers/page.controller';

const PageScreen: FC = () => {
  const { data, onSubmit, t } = awilix.resolve<PageInterface>('pageController');

  return (
    <div>
      {/* UI only — no logic */}
    </div>
  );
};

export default PageScreen;
```

## Reusable Component Pattern

```typescript
import { ButtonHTMLAttributes, FC } from 'react';
import styles from './component.module.scss';

export interface ComponentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Component: FC<ComponentProps> = ({ variant, children, className, ...otherProps }) => {
  const combinedClassName = clsx(
    { [styles.primary]: !variant || variant === 'primary' },
    className
  );
  return <button className={combinedClassName} {...otherProps}>{children}</button>;
};

export default Component;
```

## Refactoring Steps

### 1. Extract Business Logic to Controller

- Move all `useState`, `useEffect`, mutations, form handling out of the component.
- Create a controller factory function receiving `AwilixRegistry`.
- Return only what the view needs.

### 2. Standardize Props

- Extend native HTML element attributes (e.g., `ButtonHTMLAttributes`, `InputHTMLAttributes`).
- Spread `...otherProps` to forward native attributes.
- Define explicit variant/size/state props with union types.

### 3. Add Accessibility

- Use `data-testid` for test selectors.
- Add `loading="lazy"` on images.
- Dialogs: `aria-modal="true"`, `aria-labelledby`, Escape key handling, body scroll prevention.
- Interactive elements: include `:disabled` and `:focus` states.

### 4. Standardize Styling

- Use SCSS Modules with `@apply` for Tailwind utility composition.
- In Tailwind CSS 4, `@apply` inside CSS/SCSS modules requires `@reference` to import the theme context — without it, utility classes cannot be resolved.

```scss
// component-name.module.scss
@reference "tailwindcss";

.container {
  @apply flex items-center justify-center p-4;
}

.primary {
  @apply text-white bg-red-700 hover:bg-red-800;

  &:disabled {
    @apply text-white bg-gray-300 cursor-not-allowed;
  }

  &:focus {
    @apply outline-none ring-2 ring-red-500 ring-offset-2;
  }
}
```

- File naming: `component-name.module.scss` (kebab-case).
- Use `clsx` for conditional class composition in components.
- Always include `:disabled`, `:focus`, and `:hover` states for interactive elements.
- Always add `@reference "tailwindcss"` (or `@reference "../../app.css"` if using custom theme) at the top of every SCSS module that uses `@apply`.

### 5. Split Large Pages with React Fragments

When a page component grows too large, break it into focused section components and compose them with React Fragments:

```typescript
const RegistrationPage: FC = () => {
  const { formProps, stepperProps, cameraProps, t } =
    awilix.resolve<RegistrationInterface>('registrationController');

  return (
    <>
      <HeaderSection t={t} />
      <StepperSection {...stepperProps} />
      <FormSection {...formProps} />
      <CameraSection {...cameraProps} />
      <FooterSection t={t} />
    </>
  );
};
```

Rules:

- Use `<>...</>` (shorthand fragment) when no wrapper element or key is needed.
- Use `<Fragment key={id}>` when rendering lists that need keys.
- Each section component receives only the props it needs — never pass the entire controller interface.
- Section components remain presentational — no business logic, no DI resolution.
- Extract a section when it exceeds ~100 lines of JSX or has its own distinct visual block.

## Dialog Component Checklist

- [ ] Escape key closes the dialog.
- [ ] Body scroll prevented when open.
- [ ] Cleanup restores scroll on unmount.
- [ ] ARIA attributes present.
- [ ] Early return `null` when `!isOpen`.

## Validation Checklist

- [ ] No business logic in page components.
- [ ] Props extend native HTML attributes where applicable.
- [ ] `...otherProps` spread on root element.
- [ ] SCSS module file follows kebab-case naming.
- [ ] All interactive states styled (`:disabled`, `:focus`, `:hover`).
