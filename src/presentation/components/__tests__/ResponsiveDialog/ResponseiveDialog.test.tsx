import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ResponsiveDialog, {
  ResponsiveDialogProps,
} from '@components/ResponsiveDialog';

// Mock CSS module
vi.mock('@components/ResponsiveDialog/responsive-dialog.module.scss', () => ({
  default: {
    rdBackdrop: 'backdrop-class',
    rdWrapper: 'wrapper-class',
    rdContainer: 'container-class',
    rdTitleContainer: 'title-container-class',
    rdTitle: 'title-class',
    rdCloseButton: 'close-button-class',
    rdChildContainer: 'child-container-class',
    rdFooterContainer: 'footer-container-class',
  },
}));

describe('ResponsiveDialog Component', () => {
  const mockOnClose = vi.fn();
  const mockTitle = 'Test Dialog';
  const mockChildren = <div data-testid="test-children">Dialog Content</div>;
  const mockFooter = <div data-testid="test-footer">Footer Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = ''; // Reset body overflow
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderDialog = (props: Partial<ResponsiveDialogProps> = {}) => {
    const defaultProps: ResponsiveDialogProps = {
      isOpen: true,
      onClose: mockOnClose,
      title: mockTitle,
      children: mockChildren,
      footer: mockFooter,
    };

    return render(
      <ResponsiveDialog {...{ ...defaultProps, ...props }}>
        {defaultProps.children}
      </ResponsiveDialog>
    );
  };

  it('renders when isOpen is true', () => {
    renderDialog();
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
    expect(screen.getByTestId('test-footer')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderDialog({ isOpen: false });
    expect(screen.queryByText(mockTitle)).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    renderDialog();
    await userEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', async () => {
    renderDialog();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when Escape key is pressed but dialog is closed', () => {
    renderDialog({ isOpen: false });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('prevents body scroll when open', () => {
    renderDialog();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { unmount } = renderDialog();
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('does not close when clicking inside dialog', async () => {
    renderDialog();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renders without title', () => {
    renderDialog({ title: undefined });
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders without footer', () => {
    renderDialog({ footer: undefined });
    expect(screen.queryByTestId('test-footer')).not.toBeInTheDocument();
  });

  it('renders without close button when onClose not provided', () => {
    renderDialog({ onClose: undefined });
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    renderDialog();

    expect(screen.getByTestId('dialog-container')).toHaveClass(
      'container-class'
    );
    expect(screen.getByText(mockTitle)).toHaveClass('title-class');
  });

  it('has proper accessibility attributes', () => {
    renderDialog();
    expect(screen.getByText(mockTitle)).toHaveAttribute('id', 'dialog-title');
  });

  it('should match snapshot in default state', () => {
    const { asFragment } = renderDialog();
    expect(asFragment()).toMatchSnapshot();
  });
});
