---
description: Naming conventions, import ordering, constants, state management, styling, form handling, and commitlint rules
inclusion: auto
---

# Coding Standards

## Code Formatting & Linting (Mandatory)

- All code must pass ESLint without errors before committing. Run `eslint --fix` to auto-fix issues.
- All code must be formatted with Prettier. Run `prettier --write` to auto-format.
- Never disable ESLint rules inline (`eslint-disable`) without a comment explaining why.
- Never skip the pre-commit hook (`--no-verify`) — all commits must pass lint-staged checks.
- AI-generated or AI-edited code must comply with all ESLint rules and Prettier formatting at all times — not just before committing. Every file written or modified by AI must be valid and properly formatted immediately.

## Editor Settings

When generating a new project or if editor settings are missing, include the following configurations.

### EditorConfig (`.editorconfig`)

```ini
root = true

[*.{ts,tsx,js,jsx}]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
```

### VS Code (`.vscode/settings.json`)

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "prettier.stylelintIntegration": true,
  "eslint.validate": ["typescript", "typescriptreact"],
  "stylelint.validate": ["scss"],
  "files.eol": "\n"
}
```

Recommended VS Code extensions:

- `esbenp.prettier-vscode` — Prettier formatter
- `dbaeumer.vscode-eslint` — ESLint integration
- `stylelint.vscode-stylelint` — Stylelint for SCSS

### JetBrains (WebStorm/IntelliJ)

Prettier (`.idea/prettier.xml`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="PrettierConfiguration">
    <option name="myConfigurationMode" value="AUTOMATIC" />
    <option name="myRunOnSave" value="true" />
  </component>
</project>
```

ESLint (`.idea/jsLinters/eslint.xml`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="EslintConfiguration">
    <option name="fix-on-save" value="true" />
  </component>
</project>
```

Rules:

- Both ESLint fix-on-save and Prettier format-on-save must be enabled.
- Use LF line endings (`\n`) — never CRLF.
- Indent with 2 spaces for all TS/TSX/JS/JSX files.
- Always include `.editorconfig` as the baseline — it works across all editors.

## Tech Stack

| Library         | Purpose                                | Usage                                                          |
| --------------- | -------------------------------------- | -------------------------------------------------------------- |
| TanStack Router | Type-safe file-based routing           | Standard router for all projects; use with `autoCodeSplitting` |
| dayjs           | Date/time manipulation                 | Use instead of native `Date` or Moment.js                      |
| react-i18next   | Translation / internationalization     | Wraps i18next for React; use `useTranslation()` hook           |
| cross-env       | Cross-platform env vars in npm scripts | Prefix scripts with `cross-env` for Windows/Unix compat        |

### Blocked Dependency Versions

- **Axios `1.14.1`** and **Axios `0.30.4`** must never be used — these versions contain malicious code (MAL-2026-2307). If found in `package-lock.json`, remove and reinstall with a safe version immediately.

### TanStack Router Rules

- Use TanStack Router as the standard routing solution — do not use `react-router-dom`.
- Enable file-based routing with `autoCodeSplitting: true` via `TanStackRouterVite` plugin.
- Validate search/query parameters with Zod schemas (`validateSearch`).
- Use `createRootRouteWithContext` to pass shared context (e.g., `basePath`).
- Use `viewTransition: true` for smooth page transitions.
- Access route context via `useRouteContext`, navigation via custom `useNavigation` hook.
- Route files live in `src/routes/` — the generated `routeTree.gen.ts` is auto-generated and must not be edited manually.

### dayjs Rules

- Always use `dayjs` for date formatting, parsing, and manipulation — never raw `Date` objects or `toLocaleDateString`.
- Import plugins explicitly (e.g., `dayjs/plugin/relativeTime`) and extend as needed.
- Register `dayjs` in the DI container so controllers access it via `AwilixRegistry`.

### react-i18next Rules

- Use `useTranslation()` hook (via DI in controllers) to get the `t()` function.
- Always use translation keys, never hardcoded strings.
- Provide local fallback translations in `src/translation/locale/`.

### cross-env Rules

- Use `cross-env` in `package.json` scripts when setting environment variables: `"cross-env NODE_ENV=production npm run build"`.
- Never rely on shell-specific env syntax (`export`, `set`) in npm scripts.

## Naming Conventions

| Item             | Convention                        | Example                      |
| ---------------- | --------------------------------- | ---------------------------- |
| Controllers      | `kebab-case.controller.ts`        | `landing-page.controller.ts` |
| Services         | `kebab-case.service.ts`           | `registration.service.ts`    |
| Custom Hooks     | `use-kebab-case.hook.ts`          | `use-loading.hook.ts`        |
| Components       | `PascalCase/index.tsx`            | `Button/index.tsx`           |
| SCSS Modules     | `kebab-case.module.scss`          | `button.module.scss`         |
| Helpers          | `kebab-case.helper.ts`            | `string.helper.ts`           |
| Constants        | `kebab-case.ts`                   | `storage-keys.ts`            |
| Tests            | `[source-name].test.ts(x)`        | `config.test.ts`             |
| Interfaces       | `PascalCase` + `Interface` suffix | `CheckStatusInterface`       |
| DI Registry keys | `camelCase`                       | `configService`              |
| Constant values  | `UPPER_SNAKE_CASE`                | `STORAGE_KEYS`               |

## Import Rules

- Always use path aliases (`@core/*`, `@di/*`, `@controllers/*`, etc.) — never relative paths across layers.
- Import order (auto-sorted by Prettier): third-party → @core → @di → @src → @routes → @controllers → @components → @utils → @images → relative → CSS/SCSS.

## Constants

- Centralize magic strings in `utils/constants/` with `as const`.
- Export union types for type-safe key usage.
- Register constants in DI — controllers access them via `AwilixRegistry`, never import directly.

## Environment Configuration

- All env vars use `VITE_` prefix, accessed only through `src/infrastructure/config.ts`.
- Provide fallback with `??` for both `process.env` and `import.meta.env`.

## Styling

- Tailwind CSS 4 for utilities, SCSS Modules for component-scoped styles.
- Use `@apply` to compose Tailwind inside SCSS modules — requires `@reference "tailwindcss"` at the top of each SCSS module in Tailwind v4.
- Use `clsx` for conditional class composition.
- Include `:disabled` and `:focus` states for interactive elements.

## Form Handling

- React Hook Form + Zod for validation.
- Define Zod schemas inside controllers (access to `t()` for i18n messages).
- Use `mode: 'all'` for real-time validation.

## State Management

- Server/API data: TanStack Query (in use cases & controllers).
- TanStack Query uses `PersistQueryClientProvider` with async storage persister for offline cache persistence.
- Persister uses `webStorageAdapter` (localStorage via protocol) with a namespaced key and version buster.
- Default `gcTime` and `staleTime` are configured via environment variables in `config.tanStack`.
- Global app state: React Context with `useMemo`/`useCallback`.
- Form state: React Hook Form.
- Persistent state: localStorage via `LocalStorageProtocol`.
- Access context through dedicated hooks, never directly.

## Commitlint

- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `revert`.
- Format: `type(scope): Subject in sentence case`.
- Enforced via Husky `commit-msg` hook.

## Accessibility (a11y)

- ESLint enforces `jsx-a11y` recommended rules via `eslint-plugin-jsx-a11y`.
- ESLint enforces `sonarjs` recommended rules via `eslint-plugin-sonarjs` (cognitive complexity, no duplicate strings, no identical functions, etc.).
- All interactive elements must be keyboard-accessible.
- Images require `alt` attributes; decorative images use `alt=""`.
- Form inputs must have associated labels.
- Dialogs require `aria-modal`, `aria-labelledby`, and Escape key handling.
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`) over generic `<div>` with click handlers.
