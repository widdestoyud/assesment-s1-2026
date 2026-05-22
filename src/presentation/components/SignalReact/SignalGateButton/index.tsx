import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import styles from './signal-gate-button.module.css';

export interface SignalGateButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Role color theme */
  color: 'gate' | 'terminal' | 'station' | 'scout';
  /** Button size: sm for cards, lg for full pages */
  size?: 'sm' | 'lg';
  /** Button label content (supports multi-line via whitespace pre-line) */
  children: ReactNode;
}

const SignalGateButton: FC<SignalGateButtonProps> = ({
  color,
  size = 'lg',
  children,
  className,
  ...props
}) => {
  const classes = [
    styles['signal-gate-button'],
    styles[`signal-gate-button--${color}`],
    styles[`signal-gate-button--${size}`],
    className ?? '',
  ].filter(Boolean).join(' ');

  const labelSizeModifier = styles[`signal-gate-button__label--${size}`];

  return (
    <button type="button" className={classes} {...props}>
      <span className={`${styles['signal-gate-button__label']} ${labelSizeModifier}`}>
        {children}
      </span>
    </button>
  );
};

export default SignalGateButton;
