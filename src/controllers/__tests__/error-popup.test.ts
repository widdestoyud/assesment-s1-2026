import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorPopupController from '@controllers/error-popup.controller.ts';

describe('ErrorPopupController', () => {
  // Mock dependencies
  const mockPopupError = {
    isOpen: true,
    title: 'Error Title',
    message: 'Error Message',
    onClose: vi.fn(),
  };

  const mockOpenPopupError = vi.fn();
  const mockT = vi.fn(key => key);
  const mockAssets = { logo: 'asset-logo.png' };
  const mockErrorLogo = 'default-error.png';

  const mockUsePopupError = vi.fn(() => ({
    popupError: mockPopupError,
    openPopupError: mockOpenPopupError,
  }));

  const mockTranslatorLib = vi.fn(() => ({
    t: mockT,
  }));

  const mockUseQueryTanstack = vi.fn(() => ({
    data: mockAssets,
  }));

  const mockConfigService = {
    getAssets: vi.fn(),
  };

  const mockImages = {
    errorLogo: mockErrorLogo,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setupController = () => {
    return ErrorPopupController({
      usePopupError: mockUsePopupError,
      useTranslation: mockTranslatorLib,
      useQueryTanstack: mockUseQueryTanstack,
      configService: mockConfigService,
      images: mockImages,
    } as any);
  };

  describe('initialization', () => {
    it('should return the correct interface', () => {
      const controller = setupController();

      expect(controller).toEqual({
        popupError: mockPopupError,
        onClose: expect.any(Function),
        t: mockT,
        assets: mockAssets,
        defaultImage: mockErrorLogo,
      });
    });

    it('should call useQueryTanstack with correct parameters', () => {
      setupController();

      expect(mockUseQueryTanstack).toHaveBeenCalledWith({
        queryKey: ['web-assets'],
        queryFn: expect.any(Function),
        gcTime: 86400000, // 24 hours in ms
        staleTime: 3600000, // 1 hour in ms
      });

      // Verify the queryFn calls configService.getAssets()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const queryFn = mockUseQueryTanstack.mock.calls[0][0].queryFn;
      queryFn();
      expect(mockConfigService.getAssets).toHaveBeenCalled();
    });
  });

  describe('onClose', () => {
    it('should update popup state and call original onClose after delay', () => {
      const controller = setupController();

      controller.onClose();

      // Verify immediate state update
      expect(mockOpenPopupError).toHaveBeenCalledWith({
        ...mockPopupError,
        isOpen: false,
      });

      // Verify original onClose not called yet
      expect(mockPopupError.onClose).not.toHaveBeenCalled();

      // Fast-forward time
      vi.advanceTimersByTime(500);

      // Verify original onClose called after delay
      expect(mockPopupError.onClose).toHaveBeenCalled();
    });

    it('should handle case when onClose is not provided', () => {
      const controller = setupController();
      // Create a new popupError without onClose
      mockUsePopupError.mockReturnValueOnce({
        popupError: {
          isOpen: true,
          title: 'No Close Title',
          message: 'No Close Message',
        } as any,
        openPopupError: mockOpenPopupError,
      });

      controller.onClose();
      vi.advanceTimersByTime(500);

      // Should not throw even without onClose
      expect(mockOpenPopupError).toHaveBeenCalled();
    });
  });

  describe('assets loading', () => {
    it('should handle undefined assets', () => {
      mockUseQueryTanstack.mockReturnValueOnce({ data: undefined as any });
      const controller = setupController();

      expect(controller.assets).toBeUndefined();
    });

    it('should handle empty assets', () => {
      mockUseQueryTanstack.mockReturnValueOnce({ data: {} as any });
      const controller = setupController();

      expect(controller.assets).toEqual({});
    });
  });
});
