---
inclusion: fileMatch
fileMatchPattern: "src/**/*.tsx"
---

# No Nested Template Literals in className

## Rule

Never nest template literals inside `className` template strings. Extract dynamic style lookups into variables before the JSX return.

## Why

SonarCloud flags nested template literals as a code smell (Cognitive Complexity). They are harder to read and debug.

## Bad (nested template literal)

```tsx
// ❌ Nested template literal inside className
<div className={`${styles['signal-stack-group']} ${styles[`signal-stack-group--${position}`]}`}>
```

## Good (extract to variable)

```tsx
// ✅ Extract dynamic class to a variable
const positionModifier = styles[`signal-stack-group--${position}`];

return (
  <div className={`${styles['signal-stack-group']} ${positionModifier}`}>
);
```

## Pattern

When a CSS Module class name depends on a prop or variable:

```tsx
const Component: FC<Props> = ({ variant, size, color }) => {
  // Extract all dynamic modifiers BEFORE the return
  const variantClass = styles[`block--${variant}`];
  const sizeClass = styles[`block--${size}`];
  const colorClass = styles[`block__label--${color}`];

  return (
    <div className={`${styles['block']} ${variantClass} ${sizeClass}`}>
      <span className={`${styles['block__label']} ${colorClass}`}>
        ...
      </span>
    </div>
  );
};
```

## For arrays of classes (multiple dynamic modifiers)

```tsx
const classes = [
  styles['block'],
  styles[`block--${variant}`],
  styles[`block--${size}`],
  className ?? '',
].filter(Boolean).join(' ');

return <div className={classes}>...</div>;
```

## Summary

| Pattern | Allowed |
|---------|---------|
| `styles['static-class']` in template | ✅ |
| `${variable}` in template (pre-extracted) | ✅ |
| `` styles[`dynamic--${prop}`] `` in template (nested) | ❌ |
| `` styles[`dynamic--${prop}`] `` extracted to variable | ✅ |
