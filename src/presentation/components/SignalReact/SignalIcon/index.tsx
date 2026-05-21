import type { FC, HTMLAttributes } from 'react';
import styles from './signal-icon.module.css';

export type SignalColor =
  | 'primary-0' | 'primary-1' | 'primary-2' | 'primary-3' | 'primary-4'
  | 'primary-5' | 'primary-6' | 'primary-7' | 'primary-8' | 'primary-9'
  | 'secondary-0' | 'secondary-1' | 'secondary-2' | 'secondary-3' | 'secondary-4'
  | 'secondary-5' | 'secondary-6' | 'secondary-7' | 'secondary-8' | 'secondary-9'
  | 'valid-0' | 'valid-1' | 'valid-2' | 'valid-3' | 'valid-4'
  | 'valid-5' | 'valid-6' | 'valid-7' | 'valid-8' | 'valid-9'
  | 'info-0' | 'info-1' | 'info-2' | 'info-3' | 'info-4'
  | 'info-5' | 'info-6' | 'info-7' | 'info-8' | 'info-9'
  | 'warning-0' | 'warning-1' | 'warning-2' | 'warning-3' | 'warning-4'
  | 'warning-5' | 'warning-6' | 'warning-7' | 'warning-8' | 'warning-9'
  | 'error-0' | 'error-1' | 'error-2' | 'error-3' | 'error-4'
  | 'error-5' | 'error-6' | 'error-7' | 'error-8' | 'error-9'
  | 'neutral-0' | 'neutral-1' | 'neutral-2' | 'neutral-3' | 'neutral-4'
  | 'neutral-5' | 'neutral-6';

export interface SignalIconProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Icon name without the "tsel-ico_" prefix. e.g. "cashback", "logo-shape", "wallet" */
  fontIcon: string;
  /** Signal color token. e.g. "primary-5", "secondary-7", "error-5" */
  color?: SignalColor;
  /** Font size in px. Defaults to 24 */
  size?: number;
}

const SignalIcon: FC<SignalIconProps> = ({
  fontIcon,
  color,
  size = 24,
  className = '',
  style,
  ...otherProps
}) => {
  const iconClass = `tsel-ico_${fontIcon}`;
  const colorVar = color ? `var(--signal-color-${color})` : undefined;

  return (
    <i
      className={`${iconClass} ${styles['signal-icon']} ${className}`}
      style={{
        fontSize: `${size}px`,
        color: colorVar,
        ...style,
      }}
      aria-hidden="true"
      {...otherProps}
    />
  );
};

export default SignalIcon;
