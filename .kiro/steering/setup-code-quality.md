---
description: Configure ESLint, Prettier, Stylelint, Husky, lint-staged, and Commitlint for code quality enforcement
inclusion: manual
---

# Skill: Set Up Code Quality Tooling

Configure the full code quality pipeline: ESLint, Prettier, Stylelint, Husky, lint-staged, and Commitlint.

## When to Use

- Setting up a new project with standardized tooling.
- Adding missing quality tools to an existing project.

## Tools & Config Files

| Tool        | Purpose                          | Config File             |
| ----------- | -------------------------------- | ----------------------- |
| ESLint      | TypeScript & React linting       | `eslint.config.js`      |
| Prettier    | Code formatting + import sorting | `.prettierrc.json`      |
| Stylelint   | SCSS linting                     | `.stylelintrc.json`     |
| Husky       | Git hooks                        | `.husky/`               |
| lint-staged | Pre-commit checks                | `package.json`          |
| Commitlint  | Conventional commits             | `commitlint.config.cjs` |

## Steps

### 1. Commitlint

```javascript
// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\((.*)\))?:(.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'revert'],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
  },
};
```

### 2. Husky + lint-staged

```bash
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
npx husky add .husky/pre-commit 'npx lint-staged'
```

lint-staged config in `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix"],
    "*": ["prettier --write"],
    "*.{ts,tsx}": ["npm run test:staged"]
  }
}
```

### 3. ESLint Recommended Overrides

```javascript
// For DI-heavy projects:
'@typescript-eslint/no-explicit-any': 'off',
'react-hooks/exhaustive-deps': 'off',
'react-refresh/only-export-components': 'warn',
```

### 4. Prettier Import Sorting

Configure import order in `.prettierrc.json` to match path aliases:

```
third-party → @core → @di → @src → @routes → @controllers → @components → @utils → @images → relative → CSS
```

### 5. Stylelint

- Enforce 4-space indentation in SCSS files.
- Configure in `.stylelintrc.json`.

## Validation Checklist

- [ ] `commitlint.config.cjs` enforces conventional commits with sentence-case subjects.
- [ ] Husky `commit-msg` hook runs commitlint.
- [ ] Husky `pre-commit` hook runs lint-staged.
- [ ] lint-staged runs ESLint, Prettier, and tests on staged files.
- [ ] Import order matches project path aliases.
