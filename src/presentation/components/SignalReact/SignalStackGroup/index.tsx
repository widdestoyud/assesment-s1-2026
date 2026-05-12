import type { FC, ReactNode } from 'react';
import styles from './signal-stack-group.module.css';

export interface SignalStackGroupProps {
  /** Fixed position on screen */
  position?: 'top' | 'bottom';
  /** Stack children */
  children: ReactNode;
}

const SignalStackGroup: FC<SignalStackGroupProps> = ({
  position = 'bottom',
  children,
}) => {
  return (
    <div className={`${styles['signal-stack-group']} ${styles[`signal-stack-group--${position}`]}`}>
      {children}
    </div>
  );
};

export default SignalStackGroup;
