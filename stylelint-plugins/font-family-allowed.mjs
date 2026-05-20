import stylelint from 'stylelint';

const ruleName = 'custom/font-family-allowed';
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (fontName) =>
    `Unexpected font-family "${fontName}". Only "Poppins" and "TelkomselBatikSans" are allowed (self-hosted from src/assets/fonts/).`,
});

const meta = {
  url: 'https://github.com/user/project#font-family-allowed',
};

// Allowed custom font names (case-insensitive match)
const ALLOWED_FONTS = ['poppins', 'telkomselbatiksans'];

// Generic font families and CSS keywords that are always allowed
const GENERIC_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-sans-serif',
  'ui-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',
  'inherit',
  'initial',
  'unset',
  'revert',
]);

/** @type {import('stylelint').Rule} */
const ruleFunction = (primary) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: primary,
      possible: [true],
    });

    if (!validOptions) return;

    root.walkDecls(/^font(-family)?$/, (decl) => {
      const value = decl.value;

      // Skip CSS variable references
      if (value.includes('var(')) return;

      // Parse font families from the value
      // For shorthand `font`, extract the font-family part (after the last /)
      let fontFamilyPart = value;
      if (decl.prop === 'font') {
        const slashIndex = value.lastIndexOf('/');
        if (slashIndex !== -1) {
          const afterSlash = value.substring(slashIndex + 1).trim();
          const spaceIndex = afterSlash.indexOf(' ');
          fontFamilyPart = spaceIndex !== -1 ? afterSlash.substring(spaceIndex + 1) : '';
        }
      }

      // Split by comma to get individual font names
      const fonts = fontFamilyPart.split(',').map((f) => f.trim());

      for (const font of fonts) {
        if (!font) continue;

        // Remove quotes
        const cleanFont = font.replace(/^['"]|['"]$/g, '').trim();
        if (!cleanFont) continue;

        // Check if it's a generic family or CSS keyword
        if (GENERIC_FAMILIES.has(cleanFont.toLowerCase())) continue;

        // Check if it's an allowed custom font
        const isAllowed = ALLOWED_FONTS.some(
          (allowed) => allowed === cleanFont.toLowerCase(),
        );

        if (!isAllowed) {
          stylelint.utils.report({
            message: messages.rejected(cleanFont),
            node: decl,
            result,
            ruleName,
          });
        }
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default stylelint.createPlugin(ruleName, ruleFunction);
