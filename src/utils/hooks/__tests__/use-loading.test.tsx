import { renderHook } from '@testing-library/react';
import { useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useLoading from '../use-loading.hook';

// Mock the GlobalContext and React's useContext
vi.mock('react', () => ({
  ...vi.importActual('react'),
  useContext: vi.fn(),
}));

vi.mock('@src/contexts/global.context', () => ({
  default: Symbol('GlobalContext'),
}));

const mockUseContext = vi.mocked(useContext);

describe('useLoading', () => {
  const toggleLoadingMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns context values when context is fully provided', () => {
    // Mock context with both values
    mockUseContext.mockReturnValue({
      loading: true,
      toggleLoading: toggleLoadingMock,
    });

    const { result } = renderHook(() => useLoading());

    expect(result.current.loading).toBe(true);
    expect(result.current.toggleLoading).toBe(toggleLoadingMock);
  });

  it('handles missing loading value (defaults to false)', () => {
    // Mock context without loading property
    mockUseContext.mockReturnValue({
      toggleLoading: toggleLoadingMock,
    } as any);

    const { result } = renderHook(() => useLoading());

    expect(result.current.loading).toBe(false);
    expect(result.current.toggleLoading).toBe(toggleLoadingMock);
  });

  it('handles missing toggleLoading (returns undefined)', () => {
    // Mock context without toggleLoading
    mockUseContext.mockReturnValue({
      loading: true,
    } as any);

    const { result } = renderHook(() => useLoading());

    expect(result.current.loading).toBe(true);
    expect(result.current.toggleLoading).toBeUndefined();
  });

  it('handles completely undefined context', () => {
    // Mock context as undefined
    mockUseContext.mockReturnValue(undefined);

    const { result } = renderHook(() => useLoading());

    expect(result.current.loading).toBe(false);
    expect(result.current.toggleLoading).toBeUndefined();
  });
});
