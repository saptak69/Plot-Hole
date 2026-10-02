import React, { Component } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ErrorBoundary — Catches render errors in child components
 * and displays a graceful fallback instead of crashing the app.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex-1 flex items-center justify-center min-h-[50vh] px-6">
          <div className="text-center max-w-md space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-muted">
              <AlertCircle className="w-7 h-7 text-accent" />
            </div>
            <h2 className="font-display font-bold text-xl text-text-primary">
              Something went wrong
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred while loading this page.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn-secondary px-5 py-2.5 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
