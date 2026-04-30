import LoadingMask from '@pages/LoadingMask';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import awilix from '@di/container';
import Loading from '@components/Loading';

// Mock dependencies
vi.mock('@di/container');
vi.mock('@components/Loading');
vi.mock('@pages/LoadingMask/loading-mask.module.scss', () => ({
  default: {
    mask: 'mask-mock',
    globalLoader: 'globalLoader-mock',
  },
}));

describe('LoadingMask', () => {
  const mockLoadingController = {
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(awilix.resolve).mockReturnValue(mockLoadingController);
    vi.mocked(Loading).mockImplementation(() => <div data-testid="loading" />);
  });

  it('should resolve loadingController from container', () => {
    render(<LoadingMask />);
    expect(awilix.resolve).toHaveBeenCalledWith('loadingController');
  });

  it('should render Loading component when isLoading is true', () => {
    vi.mocked(awilix.resolve).mockReturnValue({ isLoading: true });
    render(<LoadingMask />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should not render when isLoading is false', () => {
    render(<LoadingMask />);
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    vi.mocked(awilix.resolve).mockReturnValue({ isLoading: true });
    const { container } = render(<LoadingMask />);

    const maskDiv = container.firstChild;
    expect(maskDiv).toHaveClass('mask-mock');

    expect(Loading).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'globalLoader-mock',
      }),
      undefined
    );
  });

  it('should match snapshot when loading is visible', () => {
    vi.mocked(awilix.resolve).mockReturnValue({ isLoading: true });
    const { asFragment } = render(<LoadingMask />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should match snapshot when not loading', () => {
    const { asFragment } = render(<LoadingMask />);
    expect(asFragment()).toMatchSnapshot();
  });
});
