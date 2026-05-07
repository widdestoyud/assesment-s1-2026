import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import styles from './signal-button.module.css';

export interface SignalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual type */
  variant?: 'primary' | 'secondary' | 'text';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Full width */
  fullWidth?: boolean;
  /** Icon on the left */
  iconLeft?: ReactNode;
  /** Icon on the right */
  iconRight?: ReactNode;
  /** Button content */
  children: ReactNode;
}

const SignalButton: FC<SignalButtonProps> = ({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  iconLeft,
  iconRight,
  children,
  className,
  ...props
}) => {
  const classes = [
    styles['signal-button'],
    styles[`signal-button--${variant}`],
    styles[`signal-button--${size}`],
    fullWidth ? styles['signal-button--full'] : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  const iconClass = styles[`signal-button__icon--${size}`];

  return (
    <button className={classes} {...props}>
      {iconLeft && <span className={iconClass}>{iconLeft}</span>}
      {children}
      {iconRight && <span className={iconClass}>{iconRight}</span>}
    </button>
  );
};

export default SignalButton;
