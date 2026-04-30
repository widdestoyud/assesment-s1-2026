import { act, render } from '@testing-library/react';
import { createContext } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { type CheckStatusResponseInterface } from '@core/services/registration.service';
import GlobalContext, {
  type ErrorPopupInterface,
  type GlobalContextInterface,
} from '../global.context';

describe('GlobalContext', () => {
  it('should create context with correct default values', () => {
    // Get the default context value
    const contextValue: GlobalContextInterface = (GlobalContext as any)
      ._currentValue;

    expect(contextValue.isIframe).toBe(false);
    expect(contextValue.detailStatus).toBeUndefined();
    expect(contextValue.loading).toBe(false);
    expect(contextValue.lng).toBe('');
    expect(contextValue.popupError).toEqual({
      isOpen: false,
    });

    // Verify function placeholders
    expect(contextValue.setDetailData).toBeInstanceOf(Function);
    expect(contextValue.toggleLoading).toBeInstanceOf(Function);
    expect(contextValue.setLng).toBeInstanceOf(Function);
    expect(contextValue.openPopupError).toBeInstanceOf(Function);
  });

  it('should provide context values to consumers', () => {
    // Mock component to test context consumption
    const TestComponent = () => {
      return (
        <GlobalContext.Consumer>
          {(value: GlobalContextInterface) => (
            <div>
              <span data-testid="isIframe">{value.isIframe.toString()}</span>
              <span data-testid="loading">{value.loading.toString()}</span>
              <span data-testid="lng">{value.lng}</span>
              <button onClick={value.toggleLoading}>Toggle</button>
              <button onClick={() => value.openPopupError({ isOpen: true })}>
                Open
              </button>
            </div>
          )}
        </GlobalContext.Consumer>
      );
    };

    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('isIframe').textContent).toBe('false');
    expect(getByTestId('loading').textContent).toBe('false');
    expect(getByTestId('lng').textContent).toBe('');
  });

  it('should create context with correct TypeScript interface', () => {
    // Verify that the context matches the interface
    const context = createContext<GlobalContextInterface>({
      isIframe: true,
      detailStatus: undefined,
      setDetailData: vi.fn(),
      loading: true,
      toggleLoading: vi.fn(),
      lng: 'en',
      setLng: vi.fn(),
      popupError: {
        isOpen: false,
        title: 'Error',
        message: 'Test message',
        image: 'error.png',
        onClose: vi.fn(),
        closeLabel: 'Close',
      },
      openPopupError: vi.fn(),
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const value: GlobalContextInterface = context._currentValue;

    // Test interface implementation
    expect(value.isIframe).toBe(true);
    expect(value.detailStatus).toBeUndefined();
    expect(value.loading).toBe(true);
    expect(value.lng).toBe('en');
    expect(value.popupError).toEqual({
      isOpen: false,
      title: 'Error',
      message: 'Test message',
      image: 'error.png',
      onClose: expect.any(Function),
      closeLabel: 'Close',
    });

    // Test function implementations
    expect(value.setDetailData).toBeInstanceOf(Function);
    act(() => {
      value.setDetailData({} as CheckStatusResponseInterface);
    });
    expect(value.setDetailData).toHaveBeenCalled();
  });

  it('should validate ErrorPopupInterface structure', () => {
    const validErrorPopup: ErrorPopupInterface = {
      isOpen: true,
      title: 'Error Title',
      message: 'Something went wrong',
      image: 'error.jpg',
      onClose: vi.fn(),
      closeLabel: 'OK',
    };

    expect(validErrorPopup.isOpen).toBe(true);
    expect(validErrorPopup.title).toBe('Error Title');
    expect(validErrorPopup.message).toBe('Something went wrong');
    expect(validErrorPopup.image).toBe('error.jpg');
    expect(validErrorPopup.onClose).toBeInstanceOf(Function);
    expect(validErrorPopup.closeLabel).toBe('OK');

    const minimalErrorPopup: ErrorPopupInterface = {
      isOpen: false,
    };

    expect(minimalErrorPopup.isOpen).toBe(false);
    expect(minimalErrorPopup.title).toBeUndefined();
  });

  it('should validate GlobalContextInterface structure', () => {
    const mockContext: GlobalContextInterface = {
      isIframe: true,
      detailStatus: {
        nik: '11111',
      } as CheckStatusResponseInterface,
      setDetailData: vi.fn(),
      loading: true,
      toggleLoading: vi.fn(),
      lng: 'id',
      setLng: vi.fn(),
      popupError: {
        isOpen: true,
        title: 'Connection Error',
      },
      openPopupError: vi.fn(),
    };

    expect(mockContext.isIframe).toBe(true);
    expect(mockContext.detailStatus?.nik).toBe('11111');
    expect(mockContext.loading).toBe(true);
    expect(mockContext.lng).toBe('id');
    expect(mockContext.popupError.isOpen).toBe(true);
    expect(mockContext.popupError.title).toBe('Connection Error');

    // Test function calls
    act(() => {
      mockContext.toggleLoading();
      mockContext.openPopupError({ isOpen: false });
    });

    expect(mockContext.toggleLoading).toHaveBeenCalledTimes(1);
    expect(mockContext.openPopupError).toHaveBeenCalledWith({ isOpen: false });
  });
});
