// GlobalProvider.test.tsx
import { useNavigate, useRouteContext } from '@tanstack/react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GlobalContext from '@src/contexts/global.context';
import { Route } from '@routes/__root';
import GlobalProvider from '../global.provider';

// Mock dependencies
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
  useRouteContext: vi.fn(),
  useRouter: vi.fn(),
  createRootRouteWithContext: vi.fn(),
}));

vi.mock('i18next', () => ({
  __esModule: true,
  default: {
    t: vi.fn(key => key), // Mock t function
    language: 'en',
  },
}));

vi.mock('i18n', () => ({
  __esModule: true,
  default: {
    t: vi.fn(key => key), // Mock t function
    language: 'en',
  },
}));

vi.mock('@routes/__root', () => ({
  Route: {
    useSearch: vi.fn(() => ({ isMobile: false })),
  },
}));

vi.mock('@utils/helpers/string.helper', () => ({
  normalizeLang: vi.fn((lang: string) => lang?.toLowerCase?.() ?? 'en'),
  toSlug: vi.fn((str: string) => str),
  generateTypeMsisdn: vi.fn((str: string) => str),
  maskNik: vi.fn((str: string) => str),
}));

// Setup before each test
const mockNavigate = vi.fn();
const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
const mockGetItem = vi.spyOn(Storage.prototype, 'getItem');
// let i18n: any;

beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();

  // Setup router mocks
  (useNavigate as any).mockReturnValue(mockNavigate);
  (useRouteContext as any).mockReturnValue({
    basePath: '/prepaid-registration',
  });

  // Reset localStorage mocks
  mockGetItem.mockImplementation(key => {
    if (key === 'isIframe') {
      return 'true';
    }
    return null;
  });

  // Reset window properties
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      reload: vi.fn(),
    },
    writable: true,
  });

  Object.defineProperty(window, 'parent', {
    value: {
      location: 'http://parent.example.com',
    },
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Test component to consume context
const TestConsumer = () => {
  return (
    <GlobalContext.Consumer>
      {context => (
        <div>
          <div data-testid="isIframe">{context.isIframe.toString()}</div>
          <div data-testid="loading">{context.loading.toString()}</div>
          <div data-testid="lng">{context.lng}</div>
          <div data-testid="detailStatus">
            {context.detailStatus
              ? JSON.stringify(context.detailStatus)
              : 'undefined'}
          </div>
          <div data-testid="popupError">
            {JSON.stringify(context.popupError)}
          </div>
          <button
            onClick={() => context.setDetailData({ nik: '12345' } as any)}
          >
            Set Detail
          </button>
          <button onClick={context.toggleLoading}>Toggle Loading</button>
          <button onClick={() => context.setLng('id')}>Set Language</button>
          <button onClick={() => context.openPopupError({ isOpen: true })}>
            Open Error
          </button>
          <button
            onClick={() =>
              context.openPopupError({
                isOpen: true,
                title: 'Custom Error',
                message: 'Something went wrong',
                image: 'custom.jpg',
                closeLabel: 'Got it',
              })
            }
          >
            Open Custom
          </button>
        </div>
      )}
    </GlobalContext.Consumer>
  );
};

describe('GlobalProvider', () => {
  it('renders and provides initial context values', () => {
    render(
      <GlobalProvider>
        <TestConsumer />
      </GlobalProvider>
    );

    expect(screen.getByTestId('isIframe').textContent).toBe('true');
    expect(screen.getByTestId('loading').textContent).toBe('true'); // Initial loading state
    expect(screen.getByTestId('lng').textContent).toBe('en');
  });

  /*it('handles iframe detection and navigation', async () => {
    // Set up iframe condition
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        href: 'http://child.example.com',
      },
      writable: true,
    });

    render(
      <GlobalProvider>
        <TestConsumer />
      </GlobalProvider>
    );

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('isIframe', 'true');
      expect(mockNavigate).toHaveBeenCalledWith({
        to: 'verification-number',
        viewTransition: true,
      });
    });

    // Verify loading state changes
    await waitFor(
      () => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      },
      { timeout: 1000 }
    );
  });*/

  /*it('handles mobile detection', () => {
    // Mock mobile detection
    (Route.useSearch as any).mockReturnValue({ isMobile: true });

    render(
      <GlobalProvider>
        <TestConsumer />
      </GlobalProvider>
    );

    expect(mockSetItem).toHaveBeenCalledWith('isIframe', 'true');
  });*/

  it('updates detail data correctly', async () => {
    render(
      <GlobalProvider>
        <TestConsumer />
      </GlobalProvider>
    );

    act(() => {
      screen.getByText('Set Detail').click();
    });

    expect(screen.getByTestId('detailStatus').textContent).toBe(
      JSON.stringify({ nik: '12345' })
    );
  });

  it('toggles loading state', () => {
    render(
      <GlobalProvider>
        <TestConsumer />
      </GlobalProvider>
    );

    act(() => {
      screen.getByText('Toggle Loading').click();
    });

    // Verify context update
    const contextValue = (GlobalContext as any)._currentValue;
    expect(contextValue.loading).toBe(false);
  });

  it('updates language correctly', () => {
    render(
      <GlobalProvider>
        <TestConsumer />
      </GlobalProvider>
    );

    expect(screen.getByTestId('lng').textContent).toBe('en');

    act(() => {
      screen.getByText('Set Language').click();
    });

    // Should update to 'id'
    expect(screen.getByTestId('lng').textContent).toBe('id');
  });

  it('opens error popup with default values', () => {
    render(
      <GlobalProvider>
        <TestConsumer />
      </GlobalProvider>
    );

    act(() => {
      screen.getByText('Open Error').click();
    });

    const popupError = JSON.parse(
      screen.getByTestId('popupError').textContent as string
    );
    expect(popupError).toMatchObject({
      isOpen: true,
      title: 'app_popup_error_title',
      message: 'app_popup_error_message',
      image: expect.any(String),
      closeLabel: 'app_popup_close_button_label',
    });
  });

  it('opens error popup with custom values', () => {
    render(
      <GlobalProvider>
        <TestConsumer />
      </GlobalProvider>
    );

    act(() => {
      // Get the actual context function
      const openErrorButton = screen.getByText('Open Error');
      openErrorButton.click();
    });

    // First open with defaults
    let popupError = JSON.parse(
      screen.getByTestId('popupError').textContent as string
    );
    expect(popupError.title).toBe('app_popup_error_title');

    // Open with custom values
    act(() => {
      const openErrorButton = screen.getByText('Open Custom');
      openErrorButton.click();
    });

    popupError = JSON.parse(
      screen.getByTestId('popupError').textContent as string
    );
    expect(popupError).toEqual({
      isOpen: true,
      title: 'Custom Error',
      message: 'Something went wrong',
      image: 'custom.jpg',
      closeLabel: 'Got it',
    });
  });

  it('does not redirect when not in iframe or mobile', async () => {
    // Set up non-iframe condition
    Object.defineProperty(window, 'parent', {
      value: window,
      writable: true,
    });

    mockGetItem.mockImplementation(() => null);
    (Route.useSearch as any).mockReturnValue({ isMobile: false });

    render(
      <GlobalProvider>
        <TestConsumer />
      </GlobalProvider>
    );

    await waitFor(() => {
      expect(mockSetItem).not.toHaveBeenCalledWith('isIframe', 'true');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
