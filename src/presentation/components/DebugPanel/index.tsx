import { type FC, useState } from 'react';
import styles from './debug-panel.module.css';

export interface DebugLog {
  timestamp: string;
  step: string;
  data: unknown;
  level: 'info' | 'error' | 'warn' | 'success';
}

export interface DebugPanelProps {
  logs: DebugLog[];
  title?: string;
  onClear?: () => void;
}

const DebugPanel: FC<DebugPanelProps> = ({ logs, title = 'Debug', onClear }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (logs.length === 0) return null;

  return (
    <div className={styles['debug-panel']}>
      <div className={styles['debug-panel__header']}>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={styles['debug-panel__toggle']}
        >
          {isCollapsed ? '▶' : '▼'} {title} ({logs.length})
        </button>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className={styles['debug-panel__clear']}
          >
            Clear
          </button>
        )}
      </div>
      {!isCollapsed && (
        <pre className={styles['debug-panel__content']}>
          {logs.map((log, i) => (
            <div
              key={`${log.timestamp}-${i}`}
              className={styles[`debug-panel__entry--${log.level}`]}
            >
              <span className={styles['debug-panel__time']}>[{log.timestamp}]</span>
              <span className={styles['debug-panel__step']}> {log.step}</span>
              {'\n'}
              {JSON.stringify(log.data, null, 2)}
              {'\n'}
            </div>
          ))}
        </pre>
      )}
    </div>
  );
};

export default DebugPanel;

/**
 * Helper to create a debug log entry with current timestamp.
 */
export function createDebugLog(
  step: string,
  data: unknown,
  level: DebugLog['level'] = 'info',
): DebugLog {
  return {
    timestamp: new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }),
    step,
    data,
    level,
  };
}
