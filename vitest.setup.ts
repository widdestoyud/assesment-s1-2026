import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { Buffer } from 'buffer';
import { afterEach, beforeAll, expect } from 'vitest';

beforeAll(() => {
  process.env.IS_REACT_ACT_ENVIRONMENT = 'true';
});

// Runs cleanup after each test case
afterEach(() => {
  cleanup();
});

expect.extend(matchers);

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
