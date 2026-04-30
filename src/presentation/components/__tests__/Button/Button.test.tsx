import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Button from '@components/Button';
import styles from '@components/Button/button.module.scss';

describe('Button Component', () => {
  // Test default rendering
  it('renders with default props', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole('button', { name: /click me/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass(styles.buttonContainer);
    expect(button).toHaveClass(styles.buttonPrimary);
    expect(button).not.toHaveClass(styles.buttonRounded);
    expect(button).not.toHaveClass(styles.buttonSizeFull);
  });

  // Test variant props
  it('applies correct variant classes', () => {
    const { getByRole, rerender } = render(
      <Button variant="primary">Primary</Button>
    );
    expect(getByRole('button')).toHaveClass(styles.buttonPrimary);

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(getByRole('button')).toHaveClass(styles.buttonSecondary);

    rerender(<Button variant="transparent">Transparent</Button>);
    expect(getByRole('button')).toHaveClass(styles.buttonTransparent);
  });

  // Test rounded prop
  it('applies rounded class when rounded prop is true', () => {
    const { getByRole } = render(<Button rounded>Rounded</Button>);
    expect(getByRole('button')).toHaveClass(styles.buttonRounded);
  });

  // Test width props
  it('applies correct width classes', () => {
    const { getByRole, rerender } = render(<Button width="full">Full</Button>);
    expect(getByRole('button')).toHaveClass(styles.buttonSizeFull);

    rerender(<Button width="half">Half</Button>);
    expect(getByRole('button')).toHaveClass(styles.buttonSizeHalf);

    rerender(<Button width="quarter">Quarter</Button>);
    expect(getByRole('button')).toHaveClass(styles.buttonSizeQuarter);
  });

  // Test className merging
  it('merges custom className with component classes', () => {
    const { getByRole } = render(
      <Button className="custom-class">Test</Button>
    );
    const button = getByRole('button');
    expect(button).toHaveClass(styles.buttonContainer);
    expect(button).toHaveClass('custom-class');
  });

  // Test button attributes
  it('passes through HTML button attributes', () => {
    const { getByRole } = render(
      <Button id="test-button" disabled aria-label="Test Button">
        Test
      </Button>
    );
    const button = getByRole('button');
    expect(button).toHaveAttribute('id', 'test-button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-label', 'Test Button');
  });

  // Test click handler
  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(
      <Button onClick={handleClick}>Clickable</Button>
    );
    getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test children rendering
  it('renders children correctly', () => {
    const { getByText } = render(
      <Button>
        <span>Child element</span>
      </Button>
    );
    expect(getByText('Child element')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(
      <Button>
        <span>Child element</span>
      </Button>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
