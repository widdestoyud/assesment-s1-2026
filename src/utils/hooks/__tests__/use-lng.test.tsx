import { act, renderHook } from '@testing-library/react';
import { useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLng } from '../use-lng.hook';

// Mock GlobalContext and useContext
vi.mock('@src/contexts/global.context', () => ({
  default: {
    _currentValue: {
      lng: 'en',
      setLng: vi.fn(),
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

describe('useLng', () => {
  const mockSetLng = vi.fn();
  const mockContextValue = {
    lng: 'en',
    setLng: mockSetLng,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useContext as any).mockImplementation(() => mockContextValue);
  });

  it('returns the correct initial values from context', () => {
    const { result } = renderHook(() => useLng());

    expect(result.current).toEqual({
      lng: 'en',
      setLng: expect.any(Function),
    });
  });

  it('returns the updated language when context changes', () => {
    const { result, rerender } = renderHook(() => useLng());

    // Initial state
    expect(result.current.lng).toBe('en');

    // Update context value
    (useContext as any).mockImplementation(() => ({
      ...mockContextValue,
      lng: 'id',
    }));

    // Trigger re-render
    rerender();

    expect(result.current.lng).toBe('id');
  });

  it('calls the context setLng function with correct value', () => {
    const { result } = renderHook(() => useLng());

    act(() => {
      result.current.setLng('fr');
    });

    expect(mockSetLng).toHaveBeenCalledWith('fr');
  });

  it('maintains the same setLng function reference across renders', () => {
    const { result, rerender } = renderHook(() => useLng());

    const firstSetLng = result.current.setLng;
    rerender();
    const secondSetLng = result.current.setLng;

    expect(firstSetLng).toBe(secondSetLng);
  });

  it('returns a new object when context values change', () => {
    const { result, rerender } = renderHook(() => useLng());

    const firstResult = result.current;

    // Update context value
    (useContext as any).mockImplementation(() => ({
      ...mockContextValue,
      lng: 'de',
    }));

    rerender();

    expect(result.current).not.toBe(firstResult);
    expect(result.current.lng).toBe('de');
    expect(result.current.setLng).toBe(firstResult.setLng); // Function reference should stay
  });

  it('handles multiple hook instances independently', () => {
    const { result: result1, rerender: rerender1 } = renderHook(() => useLng());
    const { result: result2, rerender: rerender2 } = renderHook(() => useLng());

    expect(result1.current.lng).toBe('en');
    expect(result2.current.lng).toBe('en');

    // Update context for both
    (useContext as any).mockImplementation(() => ({
      ...mockContextValue,
      lng: 'es',
    }));

    rerender1();
    rerender2();

    expect(result1.current.lng).toBe('es');
    expect(result2.current.lng).toBe('es');
  });

  it('handles undefined context safely', () => {
    (useContext as any).mockImplementation(() => undefined);

    const { result } = renderHook(() => useLng());

    // Default fallback values
    expect(result.current.lng).toBe('id');
    expect(typeof result.current.setLng).toBe('function');

    // Call should not throw
    act(() => {
      result.current.setLng('it');
    });
  });

  it('handles partial context safely', () => {
    (useContext as any).mockImplementation(() => ({
      lng: 'pt',
      // Missing setLng
    }));

    const { result } = renderHook(() => useLng());

    expect(result.current.lng).toBe('pt');
    expect(typeof result.current.setLng).toBe('function');

    // Call should not throw
    act(() => {
      result.current.setLng('ru');
    });
  });
});
