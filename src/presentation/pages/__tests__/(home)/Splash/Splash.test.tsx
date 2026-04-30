import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import awilix from '@di/container';
import Loading from '@components/Loading';
import Logo from '@components/Logo';
import SplashScreen from '@home/Splash';

// Mock the dependencies
vi.mock('@di/container');
vi.mock('@components/Loading');
vi.mock('@components/Logo');

describe('SplashScreen', () => {
  const mockSplashController = {
    isLoading: false,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Setup the awilix mock
    vi.mocked(awilix.resolve).mockReturnValue(mockSplashController);

    // Setup component mocks
    vi.mocked(Loading).mockImplementation(() => <div data-testid="loading" />);
    vi.mocked(Logo).mockImplementation(() => <div data-testid="logo" />);
  });

  it('should render the Logo component', () => {
    render(<SplashScreen />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('should not render Loading when isLoading is false', () => {
    mockSplashController.isLoading = false;
    render(<SplashScreen />);
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('should render Loading when isLoading is true', () => {
    mockSplashController.isLoading = true;
    render(<SplashScreen />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should resolve splashController from awilix container', () => {
    render(<SplashScreen />);
    expect(awilix.resolve).toHaveBeenCalledWith('splashController');
  });

  it('should have the splashContainer class', () => {
    const { container } = render(<SplashScreen />);
    expect(container.firstChild).toHaveClass('splashContainer');
  });

  it('should match snapshot in default state', () => {
    const { asFragment } = render(<SplashScreen />);
    expect(asFragment()).toMatchSnapshot();
  });
});
