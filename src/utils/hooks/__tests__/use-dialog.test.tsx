// useDialogHook.test.ts
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDialogHook } from '../use-dialog.hook';

describe('useDialogHook', () => {
  it('returns correct initial state', () => {
    const { result } = renderHook(() => useDialogHook());

    expect(result.current.isOpen).toBe(false);
    expect(typeof result.current.open).toBe('function');
    expect(typeof result.current.close).toBe('function');
    expect(typeof result.current.toggle).toBe('function');
  });

  it('open() sets isOpen to true', () => {
    const { result } = renderHook(() => useDialogHook());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('close() sets isOpen to false', () => {
    const { result } = renderHook(() => useDialogHook());

    // Open first
    act(() => {
      result.current.open();
    });

    // Then close
    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('toggle() changes state correctly', () => {
    const { result } = renderHook(() => useDialogHook());

    // First toggle (closed -> open)
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    // Second toggle (open -> closed)
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('multiple hooks maintain independent state', () => {
    const { result: result1 } = renderHook(() => useDialogHook());
    const { result: result2 } = renderHook(() => useDialogHook());

    // Open only first dialog
    act(() => {
      result1.current.open();
    });

    expect(result1.current.isOpen).toBe(true);
    expect(result2.current.isOpen).toBe(false);
  });

  it('works correctly with consecutive operations', () => {
    const { result } = renderHook(() => useDialogHook());

    act(() => {
      result.current.open();
      result.current.close();
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
      result.current.toggle();
      result.current.open();
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('handles rapid state changes', () => {
    const { result } = renderHook(() => useDialogHook());

    act(() => {
      // Open and close rapidly
      result.current.open();
      result.current.close();
      result.current.open();
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      // Rapid toggle sequence
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(true);
  });
});
