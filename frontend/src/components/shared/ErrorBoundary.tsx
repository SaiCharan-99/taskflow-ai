import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-8">
          <div className="max-w-md text-center">
            <AlertOctagon size={40} className="mx-auto text-red-400" />
            <h1 className="text-xl font-semibold text-white mt-4">Something went wrong</h1>
            <p className="text-sm text-slate-400 mt-2">
              {this.state.error?.message ?? 'Unexpected error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
