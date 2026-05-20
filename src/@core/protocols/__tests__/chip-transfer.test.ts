import { describe, expect, it } from 'vitest';

// The protocol file only exports a TypeScript interface — no runtime code.
// This test verifies the module can be imported without errors.
describe('@core/protocols/chip-transfer', () => {
  it('module is importable', async () => {
    const module = await import('@core/protocols/chip-transfer');
    expect(module).toBeDefined();
  });
});
