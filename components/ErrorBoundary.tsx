"use client";

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Contains rendering errors in its subtree so one crashing component can't blank
// the whole app. The fallback is recoverable: "Try again" re-mounts the subtree.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Logged locally for debugging only. Nothing is sent anywhere.
    console.error('Keysmith: a component error was contained by the boundary.', error);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ background: '#141417', border: '1px solid rgba(239,68,68,0.25)' }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertTriangle className="w-6 h-6" style={{ color: '#ef4444' }} />
        </div>
        <h2 className="text-base font-semibold text-white mb-1.5">Something went wrong</h2>
        <p className="text-sm text-zinc-500 mb-5 max-w-sm mx-auto leading-relaxed">
          This section hit an unexpected error. Nothing left your browser. Try again, or reload the page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={this.reset}
            className="h-9 px-4 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'rgba(122,162,247,0.12)', color: '#7aa2f7', border: '1px solid rgba(122,162,247,0.25)' }}
          >
            Try again
          </button>
          <button
            onClick={() => location.reload()}
            className="h-9 px-4 rounded-lg text-sm font-medium transition-colors"
            style={{ background: '#1a1a1e', color: '#a1a1aa', border: '1px solid #26262b' }}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
