import {
  RouterHistory,
  UseNavigateResult,
  useNavigate,
  useRouteContext,
  useRouter,
} from '@tanstack/react-router';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNavigationHook } from '../use-navigation.hook';

// Mock the entire TanStack Router module
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
  useRouteContext: vi.fn(),
  useRouter: vi.fn(),
}));

const mockUseNavigate =
  vi.fn() as unknown as UseNavigateResult<'/prepaid-registration'>;

const mockHistory: RouterHistory = {
  back: vi.fn(),
  canGoBack: vi.fn().mockReturnValue(false),
  // Add other required properties with dummy implementations
  block: vi.fn(),
  createHref: vi.fn(),
  createURL: vi.fn(),
  destroy: vi.fn(),
  forward: vi.fn(),
  go: vi.fn(),
  listen: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  location: { pathname: '', search: '', hash: '', state: null, key: '' },
  push: vi.fn(),
  replace: vi.fn(),
  action: 'POP',
  length: 0,
};

describe('useNavigationHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockHistory.canGoBack).mockReset();
  });

  const setup = (canGoBack = false, basePath = '/prepaid-registration') => {
    // Mock TanStack Router hooks
    vi.mocked(useRouteContext).mockImplementation(({ select }: any) =>
      select({ basePath })
    );

    vi.mocked(useNavigate).mockReturnValue(mockUseNavigate);

    vi.mocked(useRouter).mockReturnValue({
      history: mockHistory,
      // Add other required router properties
      state: {
        location: {
          pathname: '/test',
          search: '',
          hash: '',
          href: '',
          searchStr: '',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          state: null,
        },
        matches: [],
        status: 'idle',
      },
      subscribe: vi.fn(),
      navigate: vi.fn(),
      buildLocation: vi.fn(),
      matchRoutes: vi.fn(),
      context: {},
    });

    // Mock history's canGoBack return value
    vi.mocked(mockHistory.canGoBack).mockReturnValue(canGoBack);

    return renderHook(() => useNavigationHook());
  };

  it('returns correct navigation objects', () => {
    const { result } = setup();

    expect(result.current).toEqual({
      goBack: expect.any(Function),
      navigate: mockUseNavigate,
      history: mockHistory,
    });
  });

  it('calls history.back() when canGoBack is true', () => {
    const { result } = setup(true);

    result.current.goBack();

    expect(mockHistory.back).toHaveBeenCalled();
    expect(mockUseNavigate).not.toHaveBeenCalled();
  });

  it('navigates to landing-page when cannot go back', () => {
    const { result } = setup(false);

    result.current.goBack();

    expect(mockHistory.back).not.toHaveBeenCalled();
    expect(mockUseNavigate).toHaveBeenCalledWith({
      to: 'landing-page',
      viewTransition: true,
    });
  });

  it('uses basePath from route context', () => {
    const basePath = '/custom-path';
    setup(false, basePath);

    expect(useRouteContext).toHaveBeenCalledWith({
      from: '__root__',
      select: expect.any(Function),
    });

    const selectFn = vi.mocked(useRouteContext).mock.calls[0][0].select;
    const context = { basePath };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(selectFn(context)).toBe(basePath);
  });

  it('handles unexpected basePath type', () => {
    // Force unexpected basePath type
    vi.mocked(useRouteContext).mockImplementation(({ select }: any) =>
      select({ basePath: 123 })
    );

    const { result } = renderHook(() => useNavigationHook());

    // Should still function normally
    result.current.goBack();

    expect(mockUseNavigate).toHaveBeenCalledWith({
      to: 'landing-page',
      viewTransition: true,
    });
  });
});
