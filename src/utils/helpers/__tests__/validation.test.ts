import type { ChangeEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { maxLengthInputNumberLimit } from '../validation.helper';

describe('maxLengthInputNumberLimit', () => {
  const mockHookChange = vi.fn();
  const createEvent = (
    value: string,
    maxLength: number
  ): ChangeEvent<HTMLInputElement> =>
    ({
      target: {
        value,
        maxLength,
      } as HTMLInputElement,
      currentTarget: {
        value,
        maxLength,
      } as HTMLInputElement,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: new Event('change'),
    }) as unknown as ChangeEvent<HTMLInputElement>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('truncates value when exceeding maxLength', () => {
    const event = createEvent('123456', 5);
    maxLengthInputNumberLimit(event, mockHookChange);

    expect(event.target.value).toBe('12345');
  });

  it('does not modify value when equal to maxLength', () => {
    const event = createEvent('12345', 5);
    maxLengthInputNumberLimit(event, mockHookChange);

    expect(event.target.value).toBe('12345');
    expect(mockHookChange).toHaveBeenCalledWith(event);
  });

  it('does not modify value when shorter than maxLength', () => {
    const event = createEvent('123', 5);
    maxLengthInputNumberLimit(event, mockHookChange);

    expect(event.target.value).toBe('123');
    expect(mockHookChange).toHaveBeenCalledWith(event);
  });

  it('handles empty value', () => {
    const event = createEvent('', 5);
    maxLengthInputNumberLimit(event, mockHookChange);

    expect(event.target.value).toBe('');
    expect(mockHookChange).toHaveBeenCalledWith(event);
  });

  it('handles zero maxLength', () => {
    const event = createEvent('123', 0);
    maxLengthInputNumberLimit(event, mockHookChange);

    expect(event.target.value).toBe('');
  });

  it('handles negative maxLength', () => {
    const event = createEvent('123', -1);
    maxLengthInputNumberLimit(event, mockHookChange);

    expect(event.target.value).toBe('');
  });

  it('handles non-string values', () => {
    const event = createEvent(12345 as any, 3);
    maxLengthInputNumberLimit(event, mockHookChange);

    expect(event.target.value).toBe('123');
  });

  it('calls hookChange only once', () => {
    const event = createEvent('123456', 5);
    maxLengthInputNumberLimit(event, mockHookChange);

    expect(mockHookChange).toHaveBeenCalledTimes(1);
  });
});
