import clsx from 'classnames';
import { ButtonHTMLAttributes, FC } from 'react';
import styles from './button.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'transparent';
  rounded?: boolean;
  width?: 'standard' | 'half' | 'full' | 'quarter';
}

const Button: FC<ButtonProps> = ({
  variant,
  children,
  className,
  rounded,
  width,
  ...otherProps
}) => {
  const combinedClassName = clsx(
    {
      [styles.buttonContainer]: true,
      [styles.buttonPrimary]: !variant || variant === 'primary',
      [styles.buttonSecondary]: variant === 'secondary',
      [styles.buttonTransparent]: variant === 'transparent',
      [styles.buttonRounded]: rounded,
      [styles.buttonSizeFull]: width === 'full',
      [styles.buttonSizeHalf]: width === 'half',
      [styles.buttonSizeQuarter]: width === 'quarter',
    },
    className
  );
  return (
    <button className={combinedClassName} {...otherProps}>
      {children}
    </button>
  );
};

export default Button;
