import { renderHook } from '@testing-library/react';
import { useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useIframe from '../use-iframe.hook';

// Mock GlobalContext and useContext
vi.mock('@src/contexts/global.context', () => ({
  default: {
    _currentValue: {
      isIframe: false,
    },
  },
}));

vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useContext: vi.fn(),
  };
});

describe('useIframe', () => {
  const mockContextValue = {
    isIframe: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useContext as any).mockImplementation(() => mockContextValue);
  });

  it('returns the correct initial value from context', () => {
    const { result } = renderHook(() => useIframe());

    expect(result.current).toEqual({
      isIframe: false,
    });
  });

  it('returns true when context isIframe is true', () => {
    // Update context value
    (useContext as any).mockImplementation(() => ({
      isIframe: true,
    }));

    const { result } = renderHook(() => useIframe());

    expect(result.current).toEqual({
      isIframe: true,
    });
  });

  it('returns false when context isIframe is false', () => {
    // Explicitly set to false
    (useContext as any).mockImplementation(() => ({
      ...mockContextValue,
      isIframe: false,
    }));

    const { result } = renderHook(() => useIframe());

    expect(result.current).toEqual({
      isIframe: false,
    });
  });

  it('updates when context changes', () => {
    const { result, rerender } = renderHook(() => useIframe());

    // Initial state
    expect(result.current.isIframe).toBe(false);

    // Update context value
    (useContext as any).mockImplementation(() => ({
      ...mockContextValue,
      isIframe: true,
    }));

    // Trigger re-render
    rerender();

    expect(result.current.isIframe).toBe(true);
  });

  it('maintains the same reference when context value doesn`t change', () => {
    const { result, rerender } = renderHook(() => useIframe());

    const firstResult = result.current;
    rerender();
    const secondResult = result.current;

    expect(firstResult).toMatchObject(secondResult);
  });

  it('returns a new object when context value changes', () => {
    const { result, rerender } = renderHook(() => useIframe());

    const firstResult = result.current;

    // Update context value
    (useContext as any).mockImplementation(() => ({
      ...mockContextValue,
      isIframe: true,
    }));

    rerender();

    expect(result.current).not.toBe(firstResult);
    expect(result.current.isIframe).toBe(true);
  });

  it('works with multiple hook instances', () => {
    const { result: result1, rerender: rerender1 } = renderHook(() =>
      useIframe()
    );
    const { result: result2, rerender: rerender2 } = renderHook(() =>
      useIframe()
    );

    expect(result1.current.isIframe).toBe(false);
    expect(result2.current.isIframe).toBe(false);

    // Update context for both
    (useContext as any).mockImplementation(() => ({
      isIframe: true,
    }));

    rerender1();
    rerender2();

    expect(result1.current.isIframe).toBe(true);
    expect(result2.current.isIframe).toBe(true);
  });

  it('handles undefined context safely', () => {
    // Simulate missing context
    (useContext as any).mockImplementation(() => undefined);

    const { result } = renderHook(() => useIframe());

    expect(result.current).toEqual({
      isIframe: false,
    });
  });
});
