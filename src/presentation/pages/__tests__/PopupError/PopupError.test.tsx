import PopupError from '@pages/PopupError';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import awilix from '@di/container';
import Button from '@components/Button';
import ResponsiveDialog from '@components/ResponsiveDialog';

// Mock dependencies
vi.mock('@di/container');
vi.mock('@components/Button');
vi.mock('@components/ResponsiveDialog');
vi.mock('@pages/PopupError/popup-error.module.scss', () => ({
  default: {
    popupErrorWrapper: 'popupErrorWrapper-mock',
    popupErrorImage: 'popupErrorImage-mock',
    popupErrorTitle: 'popupErrorTitle-mock',
    popupErrorMsg: 'popupErrorMsg-mock',
  },
}));

describe('PopupError', () => {
  const mockControllerProps = {
    popupError: {
      isOpen: true,
      title: 'Error Title',
      message: 'Error Message',
      closeLabel: 'Close',
      image: 'errorImageKey',
    },
    onClose: vi.fn(),
    assets: {
      errorImageKey: 'custom-error-image.png',
    },
    defaultImage: 'default-error-image.png',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(awilix.resolve).mockReturnValue(mockControllerProps);

    // Mock component implementations
    vi.mocked(Button).mockImplementation(({ children, onClick }) => (
      <button onClick={onClick} data-testid="register-button">
        {children}
      </button>
    ));

    vi.mocked(ResponsiveDialog).mockImplementation(
      ({ children, footer, isOpen, ...props }) => {
        let className = 'closed';
        if (isOpen) {
          className = 'opened';
        }
        return (
          <div className={className} data-testid="responsive-dialog" {...props}>
            {children}
            {footer}
          </div>
        );
      }
    );
  });

  it('should resolve errorPopupController from container', () => {
    render(<PopupError />);
    expect(awilix.resolve).toHaveBeenCalledWith('errorPopupController');
  });

  it('should render ResponsiveDialog with correct props', () => {
    render(<PopupError />);

    expect(ResponsiveDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        onClose: mockControllerProps.onClose,
      }),
      undefined
    );
  });

  it('should render all error content when popup is open', () => {
    render(<PopupError />);

    expect(screen.getByText('Error Title')).toBeInTheDocument();
    expect(screen.getByText('Error Message')).toBeInTheDocument();
    expect(screen.getByTestId('register-button')).toHaveTextContent('Close');
  });

  it('should call onClose when button is clicked', () => {
    render(<PopupError />);
    fireEvent.click(screen.getByTestId('register-button'));
    expect(mockControllerProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should render custom image when available in assets', () => {
    render(<PopupError />);
    const img = screen.getByAltText('pop-up-error-image');
    expect(img).toHaveAttribute('src', 'custom-error-image.png');
    expect(img).toHaveClass('popupErrorImage-mock');
  });

  it('should fall back to default image when custom image not available', () => {
    vi.mocked(awilix.resolve).mockReturnValue({
      ...mockControllerProps,
      assets: {},
    });

    render(<PopupError />);
    expect(screen.getByAltText('pop-up-error-image')).toHaveAttribute(
      'src',
      'default-error-image.png'
    );
  });

  it('should not render button when closeLabel is not provided', () => {
    vi.mocked(awilix.resolve).mockReturnValue({
      ...mockControllerProps,
      popupError: {
        ...mockControllerProps.popupError,
        closeLabel: undefined,
      },
    });

    render(<PopupError />);
    expect(screen.queryByTestId('register-button')).not.toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    render(<PopupError />);

    const wrapper = screen.getByText('Error Title').parentElement;
    expect(wrapper).toHaveClass('popupErrorWrapper-mock');
    expect(screen.getByText('Error Title')).toHaveClass('popupErrorTitle-mock');
    expect(screen.getByText('Error Message')).toHaveClass('popupErrorMsg-mock');
  });

  it('should match snapshot when popup is open', () => {
    const { asFragment } = render(<PopupError />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should match snapshot when popup is closed', () => {
    vi.mocked(awilix.resolve).mockReturnValue({
      ...mockControllerProps,
      popupError: {
        ...mockControllerProps.popupError,
        isOpen: false,
      },
    });

    const { asFragment } = render(<PopupError />);
    expect(asFragment()).toMatchSnapshot();
  });
});
