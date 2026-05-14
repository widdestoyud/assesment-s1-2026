import type { FC } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import styles from './error-boundary.module.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

const ErrorFallback: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const handleGoHome = () => {
    resetErrorBoundary();
    window.location.href = '/';
  };

  return (
    <div className={styles['error-boundary']}>
      <div className={styles['error-boundary__card']}>
        <div className={styles['error-boundary__icon']} aria-hidden="true">
          ⚠️
        </div>
        <h1 className={styles['error-boundary__title']}>
          Terjadi Kesalahan
        </h1>
        <p className={styles['error-boundary__message']}>
          Aplikasi mengalami error yang tidak terduga. Silakan coba lagi.
        </p>
        {error && (
          <details className={styles['error-boundary__details']}>
            <summary>Detail Error</summary>
            <pre className={styles['error-boundary__stack']}>
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        )}
        <div className={styles['error-boundary__actions']}>
          <button
            type="button"
            onClick={resetErrorBoundary}
            className={styles['error-boundary__button--secondary']}
          >
            Coba Lagi
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className={styles['error-boundary__button--primary']}
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};

const ErrorBoundary: FC<ErrorBoundaryProps> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('[ErrorBoundary]', error, info);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
