import { renderHook } from '@testing-library/react';
import { useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ErrorPopupInterface } from '@src/contexts/global.context';
import usePopupError from '../use-popup-error.hook';

// Mock useContext
vi.mock('react', () => ({
  ...vi.importActual('react'),
  useContext: vi.fn(),
}));

// Mock GlobalContext module
vi.mock('@src/contexts/global.context', () => ({
  default: Symbol('GlobalContext'),
}));

const mockUseContext = vi.mocked(useContext);

describe('usePopupError', () => {
  const mockError: ErrorPopupInterface = {
    title: 'Test error',
    message: 'Something went wrong',
    isOpen: true,
  };

  const mockOpenPopupError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns context values when context is available', () => {
    // Mock context with values
    mockUseContext.mockReturnValue({
      popupError: mockError,
      openPopupError: mockOpenPopupError,
      // Add other context properties if needed
    });

    const { result } = renderHook(() => usePopupError());

    expect(result.current.popupError).toEqual(mockError);
    expect(result.current.openPopupError).toBe(mockOpenPopupError);
  });

  it('handles missing context properties', () => {
    // Mock context with partial values
    mockUseContext.mockReturnValue({
      // Missing popupError and openPopupError
    } as any);

    const { result } = renderHook(() => usePopupError());

    expect(result.current.popupError).toBeUndefined();
    expect(result.current.openPopupError).toBeUndefined();
  });

  it('handles undefined context', () => {
    // Mock context as undefined
    mockUseContext.mockReturnValue(undefined as any);

    const { result } = renderHook(() => usePopupError());

    expect(result.current.popupError).toBeUndefined();
    expect(result.current.openPopupError).toBeUndefined();
  });

  it('returns updated values when context changes', () => {
    const initialContext = {
      popupError: mockError,
      openPopupError: mockOpenPopupError,
    };

    const updatedError: ErrorPopupInterface = {
      title: 'Updated error',
      message: 'New issue occurred',
      isOpen: true,
    };

    // Mock useContext to return initial context first
    mockUseContext.mockReturnValue(initialContext);

    const { result, rerender } = renderHook(() => usePopupError());

    // Initial values
    expect(result.current.popupError).toEqual(mockError);
    expect(result.current.openPopupError).toBe(mockOpenPopupError);

    // Update context
    mockUseContext.mockReturnValue({
      ...initialContext,
      popupError: updatedError,
    });

    // Rerender with updated context
    rerender();

    // Verify updated values
    expect(result.current.popupError).toEqual(updatedError);
    expect(result.current.openPopupError).toBe(mockOpenPopupError);
  });

  it('maintains function reference stability', () => {
    const context = {
      popupError: mockError,
      openPopupError: mockOpenPopupError,
    };

    mockUseContext.mockReturnValue(context);

    const { result, rerender } = renderHook(() => usePopupError());

    const initialFunction = result.current.openPopupError;

    // Rerender with same context
    rerender();

    expect(result.current.openPopupError).toBe(initialFunction);

    // Update context with new object but same function reference
    mockUseContext.mockReturnValue({
      ...context,
      popupError: { ...mockError, message: 'New message' },
    });

    rerender();

    expect(result.current.openPopupError).toBe(initialFunction);
  });
});
