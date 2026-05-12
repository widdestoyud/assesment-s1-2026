import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './error-boundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
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
            {this.state.error && (
              <details className={styles['error-boundary__details']}>
                <summary>Detail Error</summary>
                <pre className={styles['error-boundary__stack']}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className={styles['error-boundary__actions']}>
              <button
                type="button"
                onClick={this.handleReset}
                className={styles['error-boundary__button--secondary']}
              >
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className={styles['error-boundary__button--primary']}
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
