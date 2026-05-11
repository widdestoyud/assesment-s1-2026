import type { FC, ReactNode } from 'react';
import styles from './signal-tab.module.css';

export interface SignalTabItem {
  /** Unique key for the tab */
  key: string;
  /** Tab label text */
  label: string;
  /** Optional icon above the label */
  icon?: ReactNode;
}

export interface SignalTabProps {
  /** List of tab items */
  items: SignalTabItem[];
  /** Currently active tab key */
  activeKey: string;
  /** Callback when a tab is selected */
  onSelect: (key: string) => void;
  /** Optional class name to override active tab styling (border + text color) */
  activeClassName?: string;
  /** Optional test id */
  'data-testid'?: string;
}

const SignalTab: FC<SignalTabProps> = ({
  items,
  activeKey,
  onSelect,
  activeClassName,
  'data-testid': testId,
}) => {
  return (
    <div className={styles['signal-tab']} role="tablist" data-testid={testId}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const activeClass = isActive
          ? activeClassName ?? styles['signal-tab__item--active']
          : '';

        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles['signal-tab__item']} ${activeClass}`}
            onClick={() => onSelect(item.key)}
          >
            {item.icon && (
              <span className={styles['signal-tab__icon']} aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className={styles['signal-tab__label']}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SignalTab;
