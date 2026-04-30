import { describe, expect, it, vi } from 'vitest';
import LoadingController from '@controllers/loading.controller.ts';

describe('LoadingController', () => {
  const setupController = (loadingState = false) => {
    const mockUseLoading = vi.fn(() => ({
      loading: loadingState,
    }));

    return {
      controller: LoadingController({
        useLoading: mockUseLoading,
      } as any),
      mockUseLoading,
    };
  };

  it('should return the correct interface', () => {
    const { controller } = setupController();

    expect(controller).toEqual({
      isLoading: expect.any(Boolean),
    });
  });

  it('should reflect loading state from useLoading (true)', () => {
    const { controller } = setupController(true);
    expect(controller.isLoading).toBe(true);
  });

  it('should reflect loading state from useLoading (false)', () => {
    const { controller } = setupController(false);
    expect(controller.isLoading).toBe(false);
  });

  it('should call useLoading hook', () => {
    const { mockUseLoading } = setupController();
    expect(mockUseLoading).toHaveBeenCalled();
  });
});
