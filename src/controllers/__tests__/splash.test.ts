import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SplashController from '@controllers/splash.controller.ts';

describe('SplashController', () => {
  // Mock dependencies
  const mockNavigate = vi.fn();
  const mockUseNavigation = vi.fn(() => ({
    navigate: mockNavigate,
  }));

  const mockUseEffect = vi.fn(fn => fn());

  let mockIsLoading = false;
  const mockUseCase = {
    useCase: vi.fn(() => ({
      isLoading: mockIsLoading,
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockIsLoading = false; // Reset loading state
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setupController = (isLoading = false) => {
    mockIsLoading = isLoading;
    return {
      controller: SplashController({
        getAllConfigUseCase: mockUseCase,
        useEffect: mockUseEffect,
        useNavigation: mockUseNavigation,
      } as any),
      mockUseCase,
    };
  };

  describe('initialization', () => {
    it('should return the correct interface', () => {
      const { controller } = setupController();

      expect(controller).toEqual({
        isLoading: false,
        navigate: expect.any(Function),
      });
    });

    it('should reflect loading state from useCase', () => {
      const { controller } = setupController(true);
      expect(controller.isLoading).toBe(true);
    });
  });

  describe('navigation', () => {
    it('should navigate to landing page after timeout', () => {
      setupController();

      // Verify setTimeout was called with correct delay
      expect(mockUseEffect).toHaveBeenCalled();

      // Get the effect callback
      const effectCallback = mockUseEffect.mock.calls[0][0];
      effectCallback();

      // Verify navigation not called immediately
      expect(mockNavigate).not.toHaveBeenCalled();

      // Fast-forward time
      vi.advanceTimersByTime(800);

      // Verify navigation called after timeout
      expect(mockNavigate).toHaveBeenCalledWith({
        to: 'landing-page',
        viewTransition: true,
      });
    });
  });

  describe('loading states', () => {
    it('should show loading when config is loading', () => {
      const { controller } = setupController(true);
      expect(controller.isLoading).toBe(true);
    });

    it('should not show loading when config is loaded', () => {
      const { controller } = setupController(false);
      expect(controller.isLoading).toBe(false);
    });
  });
});
